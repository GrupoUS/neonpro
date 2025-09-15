# Exemplo de Uso do Desktop Commander MCP

Este arquivo foi criado para demonstrar o uso do Desktop Commander MCP.

## Seções

1. Introdução
2. Operações Básicas
3. Operações Avançadas
4. Exemplos Práticos

### Introdução

O Desktop Commander MCP é uma ferramenta poderosa para manipulação de arquivos que oferece:
- Operações seguras com confirmação explícita
- Suporte para chunking automático
- Melhor gerenciamento de paths
- Operações atômicas

### Operações Básicas

- **Ler arquivos**: `read_file` - Suporta offset e length para leitura parcial
- **Escrever arquivos**: `write_file` - Suporta modo 'rewrite' e 'append' com chunking automático
- **Mover arquivos**: `move_file` - Operação atômica para renomear ou mover
- **Listar diretórios**: `list_directory` - Mostra estrutura detalhada com [FILE] e [DIR]
- **Criar diretórios**: `create_directory` - Cria estrutura aninhada automaticamente

### Operações Avançadas

- Editar blocos específicos: `edit_block`
- Buscar conteúdo: `start_search`
- Criar diretórios: `create_directory`

### Exemplos Práticos

Vamos demonstrar cada operação neste arquivo.