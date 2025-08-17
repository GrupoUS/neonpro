-- Verificar a estrutura das tabelas existentes
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Verificar todas as tabelas no schema public
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
