// components/landing/footer.tsx
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Footer = Footer;
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var lucide_react_1 = require("lucide-react");
function Footer() {
  var complianceLinks = [
    {
      title: "Política de Privacidade",
      description: "Como protegemos seus dados",
      href: "/privacy-policy",
      icon: lucide_react_1.Lock,
    },
    {
      title: "Termos de Uso",
      description: "Condições de utilização",
      href: "/terms-of-service",
      icon: lucide_react_1.FileText,
    },
    {
      title: "Compliance LGPD",
      description: "Conformidade Lei 13.709/2018",
      href: "/lgpd-compliance",
      icon: lucide_react_1.Shield,
    },
    {
      title: "Certificação ANVISA",
      description: "Dispositivo médico aprovado",
      href: "/anvisa-certification",
      icon: lucide_react_1.Award,
    },
  ];
  var quickLinks = [
    { title: "Recursos", href: "#features" },
    { title: "Preços", href: "/pricing" },
    { title: "Clientes", href: "#testimonials" },
    { title: "Demo", href: "#demo" },
    { title: "Blog", href: "/blog" },
    { title: "Ajuda", href: "/help" },
    { title: "Status", href: "/status" },
    { title: "API", href: "/api-docs" },
  ];
  var solutions = [
    { title: "Clínicas de Estética", href: "/solutions/aesthetic" },
    { title: "Dermatologia", href: "/solutions/dermatology" },
    { title: "Cirurgia Plástica", href: "/solutions/plastic-surgery" },
    { title: "Beleza e Bem-estar", href: "/solutions/beauty" },
    { title: "Telemedicina", href: "/solutions/telemedicine" },
    { title: "Gestão Multi-clínicas", href: "/solutions/multi-clinic" },
  ];
  var socialLinks = [
    { icon: lucide_react_1.Facebook, href: "https://facebook.com/neonpro", label: "Facebook" },
    { icon: lucide_react_1.Instagram, href: "https://instagram.com/neonpro", label: "Instagram" },
    {
      icon: lucide_react_1.Linkedin,
      href: "https://linkedin.com/company/neonpro",
      label: "LinkedIn",
    },
    { icon: lucide_react_1.Youtube, href: "https://youtube.com/neonpro", label: "YouTube" },
  ];
  return (
    <footer className="bg-slate-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600">
                <span className="text-sm font-bold text-white">N</span>
              </div>
              <span className="text-xl font-bold">NeonPro</span>
              <badge_1.Badge className="bg-sky-100 text-sky-700 text-xs">Healthcare</badge_1.Badge>
            </div>

            <p className="text-slate-300 leading-relaxed">
              Plataforma brasileira de saúde digital com IA, compliance automático e ferramentas
              especializadas para clínicas estéticas.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <lucide_react_1.Phone className="h-4 w-4 text-sky-400" />
                <span className="text-sm text-slate-300">(11) 4005-2030</span>
              </div>
              <div className="flex items-center space-x-3">
                <lucide_react_1.MessageSquare className="h-4 w-4 text-green-400" />
                <span className="text-sm text-slate-300">(11) 99999-0000</span>
              </div>
              <div className="flex items-center space-x-3">
                <lucide_react_1.Mail className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-slate-300">contato@neonpro.health</span>
              </div>
              <div className="flex items-start space-x-3">
                <lucide_react_1.MapPin className="h-4 w-4 text-red-400 mt-0.5" />
                <span className="text-sm text-slate-300">
                  São Paulo, SP
                  <br />
                  Brasil
                </span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5 text-slate-300" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Links Rápidos</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-slate-300 hover:text-white transition-colors text-sm"
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Soluções</h3>
            <ul className="space-y-3">
              {solutions.map((solution, index) => (
                <li key={index}>
                  <a
                    href={solution.href}
                    className="text-slate-300 hover:text-white transition-colors text-sm"
                  >
                    {solution.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Compliance & Legal */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Compliance & Legal</h3>
            <div className="space-y-4">
              {complianceLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="flex items-start space-x-3 p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors group"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700 group-hover:bg-slate-600 flex-shrink-0">
                    <link.icon className="h-4 w-4 text-slate-300" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white group-hover:text-sky-300">
                      {link.title}
                    </h4>
                    <p className="text-xs text-slate-400">{link.description}</p>
                  </div>
                  <lucide_react_1.ExternalLink className="h-3 w-3 text-slate-500 group-hover:text-slate-300 flex-shrink-0 mt-1" />
                </a>
              ))}
            </div>

            {/* Compliance Badges */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Certificações:</h4>
              <div className="grid grid-cols-2 gap-2">
                <badge_1.Badge className="bg-green-900 text-green-300 border-green-700 text-xs justify-center">
                  LGPD 2020
                </badge_1.Badge>
                <badge_1.Badge className="bg-blue-900 text-blue-300 border-blue-700 text-xs justify-center">
                  ANVISA
                </badge_1.Badge>
                <badge_1.Badge className="bg-purple-900 text-purple-300 border-purple-700 text-xs justify-center">
                  CFM 2.314/2022
                </badge_1.Badge>
                <badge_1.Badge className="bg-amber-900 text-amber-300 border-amber-700 text-xs justify-center">
                  ISO 27001
                </badge_1.Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <separator_1.Separator className="bg-slate-700" />

      {/* Bottom Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Copyright */}
          <div className="space-y-2">
            <p className="text-sm text-slate-300">
              © 2025 NeonPro Healthcare Solutions. Todos os direitos reservados.
            </p>
            <p className="text-xs text-slate-400">
              CNPJ: 00.000.000/0001-00 | Razão Social: NeonPro Tecnologia em Saúde Ltda.
            </p>
          </div>

          {/* Legal & Compliance Notice */}
          <div className="text-right space-y-2">
            <div className="flex justify-end items-center space-x-2">
              <lucide_react_1.Shield className="h-4 w-4 text-green-400" />
              <span className="text-sm text-slate-300">Sistema em conformidade com LGPD</span>
            </div>
            <p className="text-xs text-slate-400">
              Dados protegidos com criptografia AES-256 | Servidores no Brasil
            </p>
          </div>
        </div>

        {/* Additional Compliance Info */}
        <div className="mt-8 p-4 bg-slate-800 rounded-lg border border-slate-700">
          <div className="flex items-start space-x-3">
            <lucide_react_1.Shield className="h-5 w-5 text-sky-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">
                Compromisso com a Privacidade e Segurança
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                O NeonPro processa dados pessoais de saúde em estrita conformidade com a Lei Geral
                de Proteção de Dados (LGPD - Lei 13.709/2018), regulamentações da ANVISA para
                dispositivos médicos, e Resolução CFM 2.314/2022 para telemedicina. Todos os dados
                são criptografados, armazenados em servidores brasileiros certificados, e acessados
                apenas por profissionais autorizados para finalidades médicas legítimas.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href="/privacy-policy"
                  className="text-xs text-sky-400 hover:text-sky-300 underline"
                >
                  Política de Privacidade
                </a>
                <span className="text-slate-500">•</span>
                <a
                  href="/data-processing"
                  className="text-xs text-sky-400 hover:text-sky-300 underline"
                >
                  Tratamento de Dados
                </a>
                <span className="text-slate-500">•</span>
                <a
                  href="/patient-rights"
                  className="text-xs text-sky-400 hover:text-sky-300 underline"
                >
                  Direitos do Titular
                </a>
                <span className="text-slate-500">•</span>
                <a
                  href="/dpo-contact"
                  className="text-xs text-sky-400 hover:text-sky-300 underline"
                >
                  Contato DPO
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Development Attribution */}
        <div className="mt-6 pt-6 border-t border-slate-700 text-center">
          <p className="text-xs text-slate-500">
            Desenvolvido com ❤️ para o setor de saúde brasileiro | Infraestrutura: Vercel + Supabase
            | Monitoramento: 99.9% uptime
          </p>
        </div>
      </div>
    </footer>
  );
}
