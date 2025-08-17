-- =====================================================
-- Script de Configuração Inicial - Automação LGPD
-- NeonPro - Sistema de Gestão Clínica
-- =====================================================

-- Verificar se as tabelas já existem
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lgpd_automation_config') THEN
        RAISE NOTICE 'Executando migração das tabelas de automação LGPD...';
        -- A migração será executada pelo arquivo de migração
    ELSE
        RAISE NOTICE 'Tabelas de automação LGPD já existem.';
    END IF;
END $$;

-- Inserir configurações padrão para clínicas existentes
INSERT INTO lgpd_automation_config (
    clinic_id,
    enabled,
    schedules,
    features,
    notifications,
    limits,
    created_by
)
SELECT 
    c.id as clinic_id,
    false as enabled,
    jsonb_build_object(
        'full_automation', jsonb_build_object(
            'enabled', false,
            'cron_expression', '0 2 * * *',
            'timezone', 'America/Sao_Paulo'
        ),
        'consent_management', jsonb_build_object(
            'enabled', false,
            'cron_expression', '0 */6 * * *',
            'timezone', 'America/Sao_Paulo'
        ),
        'data_subject_rights', jsonb_build_object(
            'enabled', false,
            'cron_expression', '0 */4 * * *',
            'timezone', 'America/Sao_Paulo'
        )
    ) as schedules,
    jsonb_build_object(
        'consent_management', true,
        'data_subject_rights_processing', true,
        'audit_reporting', true,
        'data_anonymization', false,
        'real_time_monitoring', true,
        'intelligent_alerts', true
    ) as features,
    jsonb_build_object(
        'email', jsonb_build_object(
            'enabled', false,
            'recipients', jsonb_build_array()
        ),
        'webhook', jsonb_build_object(
            'enabled', false,
            'url', ''
        )
    ) as notifications,
    jsonb_build_object(
        'max_concurrent_jobs', 3,
        'job_timeout_minutes', 30,
        'max_retry_attempts', 3,
        'batch_size', 100
    ) as limits,
    (SELECT id FROM auth.users WHERE email LIKE '%admin%' LIMIT 1) as created_by
FROM clinics c
WHERE c.id NOT IN (SELECT clinic_id FROM lgpd_automation_config)
ON CONFLICT (clinic_id) DO NOTHING;

-- Inserir métricas iniciais para clínicas
INSERT INTO lgpd_compliance_metrics (
    clinic_id,
    metric_type,
    metric_value,
    metadata,
    recorded_at
)
SELECT 
    c.id as clinic_id,
    'compliance_score' as metric_type,
    0 as metric_value,
    jsonb_build_object(
        'initial_setup', true,
        'components', jsonb_build_object(
            'consent_score', 0,
            'audit_score', 0,
            'alert_score', 0,
            'request_score', 0
        )
    ) as metadata,
    NOW() as recorded_at
FROM clinics c
WHERE c.id NOT IN (
    SELECT clinic_id FROM lgpd_compliance_metrics 
    WHERE metric_type = 'compliance_score'
)
ON CONFLICT DO NOTHING;

-- Criar alertas de boas-vindas para clínicas
INSERT INTO lgpd_compliance_alerts (
    clinic_id,
    title,
    description,
    category,
    severity,
    status,
    metadata,
    created_by
)
SELECT 
    c.id as clinic_id,
    'Bem-vindo à Automação LGPD' as title,
    'Configure a automação LGPD para garantir conformidade total com a Lei Geral de Proteção de Dados.' as description,
    'setup' as category,
    'low' as severity,
    'active' as status,
    jsonb_build_object(
        'setup_required', true,
        'priority_actions', jsonb_build_array(
            'Configurar agendamentos',
            'Habilitar recursos necessários',
            'Configurar notificações',
            'Executar primeira auditoria'
        )
    ) as metadata,
    (SELECT id FROM auth.users WHERE email LIKE '%admin%' LIMIT 1) as created_by
FROM clinics c
WHERE c.id NOT IN (
    SELECT clinic_id FROM lgpd_compliance_alerts 
    WHERE title = 'Bem-vindo à Automação LGPD'
)
ON CONFLICT DO NOTHING;

-- Função para verificar configuração da clínica
CREATE OR REPLACE FUNCTION check_clinic_lgpd_setup(p_clinic_id UUID)
RETURNS jsonb AS $$
DECLARE
    config_exists BOOLEAN := false;
    automation_enabled BOOLEAN := false;
    features_count INTEGER := 0;
    alerts_count INTEGER := 0;
    setup_score INTEGER := 0;
    result jsonb;
BEGIN
    -- Verificar se configuração existe
    SELECT EXISTS(
        SELECT 1 FROM lgpd_automation_config 
        WHERE clinic_id = p_clinic_id
    ) INTO config_exists;
    
    IF config_exists THEN
        -- Verificar se automação está habilitada
        SELECT enabled INTO automation_enabled
        FROM lgpd_automation_config 
        WHERE clinic_id = p_clinic_id;
        
        -- Contar recursos habilitados
        SELECT (
            CASE WHEN features->>'consent_management' = 'true' THEN 1 ELSE 0 END +
            CASE WHEN features->>'data_subject_rights_processing' = 'true' THEN 1 ELSE 0 END +
            CASE WHEN features->>'audit_reporting' = 'true' THEN 1 ELSE 0 END +
            CASE WHEN features->>'real_time_monitoring' = 'true' THEN 1 ELSE 0 END +
            CASE WHEN features->>'intelligent_alerts' = 'true' THEN 1 ELSE 0 END
        ) INTO features_count
        FROM lgpd_automation_config 
        WHERE clinic_id = p_clinic_id;
    END IF;
    
    -- Contar alertas ativos
    SELECT COUNT(*) INTO alerts_count
    FROM lgpd_compliance_alerts 
    WHERE clinic_id = p_clinic_id AND status = 'active';
    
    -- Calcular score de configuração
    setup_score := (
        CASE WHEN config_exists THEN 20 ELSE 0 END +
        CASE WHEN automation_enabled THEN 30 ELSE 0 END +
        (features_count * 10) +
        CASE WHEN alerts_count = 0 THEN 20 ELSE 0 END
    );
    
    -- Montar resultado
    result := jsonb_build_object(
        'clinic_id', p_clinic_id,
        'config_exists', config_exists,
        'automation_enabled', automation_enabled,
        'features_enabled', features_count,
        'active_alerts', alerts_count,
        'setup_score', setup_score,
        'setup_complete', setup_score >= 80,
        'recommendations', CASE 
            WHEN NOT config_exists THEN jsonb_build_array('Criar configuração inicial')
            WHEN NOT automation_enabled THEN jsonb_build_array('Habilitar automação')
            WHEN features_count < 3 THEN jsonb_build_array('Habilitar mais recursos')
            WHEN alerts_count > 5 THEN jsonb_build_array('Resolver alertas pendentes')
            ELSE jsonb_build_array('Configuração adequada')
        END
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Função para configuração rápida
CREATE OR REPLACE FUNCTION quick_setup_lgpd_automation(
    p_clinic_id UUID,
    p_user_id UUID DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
    config_id UUID;
    result jsonb;
BEGIN
    -- Inserir ou atualizar configuração
    INSERT INTO lgpd_automation_config (
        clinic_id,
        enabled,
        schedules,
        features,
        notifications,
        limits,
        created_by,
        updated_by
    ) VALUES (
        p_clinic_id,
        true,
        jsonb_build_object(
            'full_automation', jsonb_build_object(
                'enabled', true,
                'cron_expression', '0 2 * * *',
                'timezone', 'America/Sao_Paulo'
            ),
            'consent_management', jsonb_build_object(
                'enabled', true,
                'cron_expression', '0 */6 * * *',
                'timezone', 'America/Sao_Paulo'
            ),
            'data_subject_rights', jsonb_build_object(
                'enabled', true,
                'cron_expression', '0 */4 * * *',
                'timezone', 'America/Sao_Paulo'
            )
        ),
        jsonb_build_object(
            'consent_management', true,
            'data_subject_rights_processing', true,
            'audit_reporting', true,
            'data_anonymization', false,
            'real_time_monitoring', true,
            'intelligent_alerts', true
        ),
        jsonb_build_object(
            'email', jsonb_build_object(
                'enabled', false,
                'recipients', jsonb_build_array()
            ),
            'webhook', jsonb_build_object(
                'enabled', false,
                'url', ''
            )
        ),
        jsonb_build_object(
            'max_concurrent_jobs', 3,
            'job_timeout_minutes', 30,
            'max_retry_attempts', 3,
            'batch_size', 100
        ),
        COALESCE(p_user_id, (SELECT id FROM auth.users LIMIT 1)),
        COALESCE(p_user_id, (SELECT id FROM auth.users LIMIT 1))
    )
    ON CONFLICT (clinic_id) DO UPDATE SET
        enabled = true,
        schedules = EXCLUDED.schedules,
        features = EXCLUDED.features,
        updated_by = COALESCE(p_user_id, (SELECT id FROM auth.users LIMIT 1)),
        updated_at = NOW()
    RETURNING id INTO config_id;
    
    -- Resolver alerta de boas-vindas
    UPDATE lgpd_compliance_alerts 
    SET 
        status = 'resolved',
        resolved_at = NOW(),
        resolved_by = COALESCE(p_user_id, (SELECT id FROM auth.users LIMIT 1)),
        resolution_notes = 'Configuração rápida executada com sucesso'
    WHERE 
        clinic_id = p_clinic_id 
        AND title = 'Bem-vindo à Automação LGPD'
        AND status = 'active';
    
    -- Criar alerta de sucesso
    INSERT INTO lgpd_compliance_alerts (
        clinic_id,
        title,
        description,
        category,
        severity,
        status,
        metadata,
        created_by
    ) VALUES (
        p_clinic_id,
        'Automação LGPD Configurada',
        'A automação LGPD foi configurada com sucesso. O sistema está pronto para garantir conformidade.',
        'success',
        'low',
        'active',
        jsonb_build_object(
            'auto_setup', true,
            'config_id', config_id,
            'next_steps', jsonb_build_array(
                'Revisar configurações de notificação',
                'Executar primeira auditoria',
                'Monitorar dashboard de conformidade'
            )
        ),
        COALESCE(p_user_id, (SELECT id FROM auth.users LIMIT 1))
    );
    
    -- Registrar evento de auditoria
    INSERT INTO lgpd_audit_trail (
        clinic_id,
        user_id,
        action,
        resource_type,
        resource_id,
        details,
        ip_address,
        user_agent
    ) VALUES (
        p_clinic_id,
        COALESCE(p_user_id, (SELECT id FROM auth.users LIMIT 1)),
        'quick_setup_completed',
        'automation_config',
        config_id::text,
        jsonb_build_object(
            'setup_type', 'quick_setup',
            'features_enabled', 5,
            'automation_enabled', true
        ),
        '127.0.0.1',
        'LGPD Setup Script'
    );
    
    result := jsonb_build_object(
        'success', true,
        'config_id', config_id,
        'message', 'Automação LGPD configurada com sucesso',
        'next_steps', jsonb_build_array(
            'Acessar /compliance/automation',
            'Revisar configurações',
            'Configurar notificações',
            'Executar primeira auditoria'
        )
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar saúde do sistema
CREATE OR REPLACE FUNCTION check_lgpd_system_health()
RETURNS jsonb AS $$
DECLARE
    total_clinics INTEGER;
    configured_clinics INTEGER;
    active_automations INTEGER;
    total_alerts INTEGER;
    critical_alerts INTEGER;
    recent_jobs INTEGER;
    failed_jobs INTEGER;
    result jsonb;
BEGIN
    -- Estatísticas gerais
    SELECT COUNT(*) INTO total_clinics FROM clinics;
    SELECT COUNT(*) INTO configured_clinics FROM lgpd_automation_config;
    SELECT COUNT(*) INTO active_automations FROM lgpd_automation_config WHERE enabled = true;
    
    -- Alertas
    SELECT COUNT(*) INTO total_alerts FROM lgpd_compliance_alerts WHERE status = 'active';
    SELECT COUNT(*) INTO critical_alerts FROM lgpd_compliance_alerts 
    WHERE status = 'active' AND severity = 'critical';
    
    -- Jobs recentes (últimas 24h)
    SELECT COUNT(*) INTO recent_jobs FROM lgpd_automation_jobs 
    WHERE created_at >= NOW() - INTERVAL '24 hours';
    SELECT COUNT(*) INTO failed_jobs FROM lgpd_automation_jobs 
    WHERE created_at >= NOW() - INTERVAL '24 hours' AND status = 'failed';
    
    result := jsonb_build_object(
        'timestamp', NOW(),
        'system_status', CASE 
            WHEN critical_alerts > 0 THEN 'critical'
            WHEN failed_jobs > recent_jobs * 0.1 THEN 'warning'
            ELSE 'healthy'
        END,
        'statistics', jsonb_build_object(
            'total_clinics', total_clinics,
            'configured_clinics', configured_clinics,
            'active_automations', active_automations,
            'configuration_coverage', ROUND((configured_clinics::NUMERIC / NULLIF(total_clinics, 0)) * 100, 2),
            'automation_adoption', ROUND((active_automations::NUMERIC / NULLIF(configured_clinics, 0)) * 100, 2)
        ),
        'alerts', jsonb_build_object(
            'total_active', total_alerts,
            'critical', critical_alerts,
            'alert_rate', ROUND((total_alerts::NUMERIC / NULLIF(total_clinics, 0)), 2)
        ),
        'jobs', jsonb_build_object(
            'recent_24h', recent_jobs,
            'failed_24h', failed_jobs,
            'success_rate', CASE 
                WHEN recent_jobs > 0 THEN ROUND(((recent_jobs - failed_jobs)::NUMERIC / recent_jobs) * 100, 2)
                ELSE 100
            END
        ),
        'recommendations', CASE 
            WHEN configured_clinics < total_clinics THEN jsonb_build_array('Configurar automação para todas as clínicas')
            WHEN critical_alerts > 0 THEN jsonb_build_array('Resolver alertas críticos imediatamente')
            WHEN failed_jobs > recent_jobs * 0.1 THEN jsonb_build_array('Investigar falhas nos jobs')
            ELSE jsonb_build_array('Sistema funcionando adequadamente')
        END
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Executar verificação inicial
SELECT check_lgpd_system_health() as system_health;

-- Mostrar estatísticas de configuração
SELECT 
    'Configuração LGPD' as categoria,
    COUNT(*) as total_clinicas,
    COUNT(*) FILTER (WHERE lac.id IS NOT NULL) as clinicas_configuradas,
    COUNT(*) FILTER (WHERE lac.enabled = true) as automacao_ativa,
    ROUND(
        (COUNT(*) FILTER (WHERE lac.id IS NOT NULL)::NUMERIC / COUNT(*)::NUMERIC) * 100, 
        2
    ) as percentual_configurado
FROM clinics c
LEFT JOIN lgpd_automation_config lac ON c.id = lac.clinic_id;

-- Mostrar alertas por severidade
SELECT 
    severity as severidade,
    COUNT(*) as quantidade,
    COUNT(*) FILTER (WHERE status = 'active') as ativos,
    COUNT(*) FILTER (WHERE status = 'resolved') as resolvidos
FROM lgpd_compliance_alerts
GROUP BY severity
ORDER BY 
    CASE severity 
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
    END;

-- Comentários finais
COMMENT ON FUNCTION check_clinic_lgpd_setup(UUID) IS 'Verifica o status de configuração LGPD de uma clínica específica';
COMMENT ON FUNCTION quick_setup_lgpd_automation(UUID, UUID) IS 'Executa configuração rápida da automação LGPD para uma clínica';
COMMENT ON FUNCTION check_lgpd_system_health() IS 'Verifica a saúde geral do sistema de automação LGPD';

-- Mensagem de conclusão
DO $$
BEGIN
    RAISE NOTICE '✅ Configuração inicial da Automação LGPD concluída com sucesso!';
    RAISE NOTICE '📋 Próximos passos:';
    RAISE NOTICE '   1. Acessar /compliance/automation no dashboard';
    RAISE NOTICE '   2. Revisar e ajustar configurações por clínica';
    RAISE NOTICE '   3. Configurar notificações (email/webhook)';
    RAISE NOTICE '   4. Executar primeira auditoria completa';
    RAISE NOTICE '   5. Monitorar dashboard de conformidade';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Funções disponíveis:';
    RAISE NOTICE '   - check_clinic_lgpd_setup(clinic_id) - Verificar configuração';
    RAISE NOTICE '   - quick_setup_lgpd_automation(clinic_id, user_id) - Configuração rápida';
    RAISE NOTICE '   - check_lgpd_system_health() - Verificar saúde do sistema';
END $$;