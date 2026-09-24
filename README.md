# Suporte Inteligente (RAG Corporativo)

    Sistema de suporte corporativo soberano baseado na arquitetura Retrieval-Augmented Generation (RAG). Desenvolvido como Trabalho de Conclusão de Curso (TCC) em Sistemas de Informação.

    Este repositório contém o código-fonte da aplicação (Frontend e Backend) e adota práticas rigorosas de engenharia de software para controle de versão, integração e isolamento de dependências.

## Estrutura do Monorepo

* **/front**: Aplicação cliente construída com React, Next.js (App Router) e Tailwind CSS.
* **/back**: API RESTful e orquestração de IA implementada em Python com FastAPI, SQLAlchemy, PostgreSQL/pgvector e integração local com Ollama.

## Configuração do Ambiente Local
    Para executar o projeto localmente para desenvolvimento e testes, certifique-se de ter o Node.js (v18+), Python (v3.10+) e o Ollama instalados na máquina.

### 1. Clonar o Repositório
    Inicie clonando o repositório e acedendo ao diretório raiz:
```bash
    git clone [https://github.com/mariaaquino150404/tcc.git](https://github.com/mariaaquino150404/tcc.git)
    cd tcc

2. Configuração do Motor de IA
    O sistema exige que o motor Ollama esteja em execução local com os modelos especificados na arquitetura:
    Bash
    ollama pull bge-m3
    ollama pull phi3

3. Configuração do Backend (Python/FastAPI)
    Abra um terminal, aceda ao diretório do backend, crie o ambiente virtual e instale as dependências:

    Bash
    cd back

    # Criação do ambiente virtual
        python -m venv venv

    # Ativação do ambiente virtual (Windows)
        venv\Scripts\activate
    # (Se utilizar Linux/macOS, utilize: source venv/bin/activate)

    # Instalação das dependências
        pip install -r requirements.txt
        Antes de iniciar, crie um ficheiro .env na pasta back (utilizando o .env.example como referência para as credenciais da base de dados PostgreSQL) e inicie o servidor:

        Bash
        uvicorn app.main:app --reload
        A API estará disponível na porta 8000.

4. Configuração do Frontend (Node.js/Next.js)
    Abra um novo terminal, aceda ao diretório do frontend e instale os pacotes necessários:

    Bash
    cd front

        # Instalação das dependências
        npm install

        # Inicialização do servidor de desenvolvimento
        npm run dev
        A interface de utilizador estará acessível em http://localhost:3000.

Estratégia de Branching
    O repositório utiliza um modelo disciplinado de integração:

        main: Branch de produção. Protegida. Recebe atualizações exclusivamente via Pull Requests (PR) aprovados. O envio direto (push) é tecnicamente bloqueado pelo servidor.

        test: Branch de integração e testes operacionais. Todo o desenvolvimento ativo deve ser consolidado e testado aqui antes da promoção para a branch de produção.

    Padrão de Commits (Conventional Commits)
        Para manter a rastreabilidade, a automação de changelogs e a legibilidade do histórico de versão, este projeto adota a especificação Conventional Commits.

    Todo commit deve obrigatoriamente seguir a seguinte estrutura de assinatura:
        "tipo: descrição clara e no imperativo"

    Tipos Permitidos
        feat: Introdução de uma nova funcionalidade no sistema.
        fix: Correção de um bug ou falha operacional detectada.
        refactor: Alteração no código que não corrige um bug nem adiciona uma funcionalidade (ex: melhoria de performance, reestruturação interna, limpeza de código).
        chore: Atualização de tarefas de build, configurações de sistema, modificações no .gitignore ou gerenciamento de dependências.
        docs: Inclusões ou alterações exclusivamente em arquivos de documentação (Wiki, README).
        style: Alterações de formatação de código (espaçamento, vírgulas, aspas) que não afetam a lógica.

    Exemplos de Uso Prático
        feat: implementa bloqueio de sessões simultâneas via token JWT
        fix: corrige threshold de cosine_distance do pgvector para 0.50
        chore: remove diretório node_modules e .next do rastreamento do git
        refactor: otimiza renderização do componente de tabela de usuários
        docs: atualiza arquitetura do backend na wiki oficial

Fluxo de Trabalho (Como Codificar e Enviar)
    Para garantir a estabilidade do repositório, siga o ciclo de desenvolvimento abaixo:

    Certifique-se de estar na branch de testes:
        git checkout test

    Atualize o repositório local com a última versão do servidor:
        git pull origin test

    Realize as suas implementações, limpe o cache de dependências e adicione ao stage:
        git add .

    Crie o commit respeitando o padrão estabelecido:
        git commit -m "tipo: sua descrição aqui"

    Envie a atualização para a nuvem:
        git push origin test

    Para oficializar a versão, aceda ao GitHub e abra um Pull Request (PR) solicitando a fusão (merge) da branch test para a main.

Controle de Versão e Propriedade Intelectual
Desenvolvimento e Engenharia de Software: Maria Clara de Aquino de Souza

Vínculo Acadêmico: Trabalho de Conclusão de Curso (TCC) em Sistemas de Informação — UniLaSalle

Versão da Documentação: 1.0.0-release

Aviso de Licenciamento e Uso
    A arquitetura de processamento vetorial, os pipelines de integração LLM e o código-fonte associados a este repositório constituem propriedade intelectual de caráter acadêmico e corporativo. A reprodução, distribuição, ramificação (forking) não autorizada ou engenharia reversa do ecossistema de RAG aqui documentado submetem-se às diretrizes institucionais de proteção a direitos autorais e integridade de software.