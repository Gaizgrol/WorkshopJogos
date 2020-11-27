# :rocket: Workshop de Jogos


Projeto utilizado para realizar o treinamento de equipes, tendo em vista o aprimoramento das habilidades de um grupo na hora de desenvolver aplicações no geral, com foco em JavaScript.

---

## :computer: O projeto

A aplicação desenvolvida nesse workshop será um jogo 2D voltado para navegadores de computadores, utizando HTML, CSS e JavaScript puro.

Nossa escolha de não utilizar nenhuma biblioteca externa é proposital, pois o objetivo é explorar as ferramentas nativas do JavaScript e montar um projeto do zero.

### :dart: Objetivos

* Desenvolver projetos em equipe utilizando git como programa de versionamento e o Github como repositório remoto;
* Aprimorar habilidades de modelagem, estruturação e desenvolvimento aplicações;
* Montar ou utilizar uma arquitetura de projeto existente;
* Treinar e descobrir novas formas de resolver problemas com o JavaScript;
* Criar o hábito de documentar projetos.


## :joystick: Jogo

### :information_source: Descrição

O jogador controla uma nave de exploração que se move livremente pela tela. Asteróides aparecem no cenário e seu objetivo é destruí-los.

### :spiral_notepad: Especificações do projeto

**:bar_chart: Cena principal**

Tela na qual iremos jogar. Nela mostraremos a nave e os asteroides.

*:pushpin: Requisitos mínimos*:

* Nave do jogador:
    * Deve se mexer na horizontal e na vertical, respeitando os limites da tela;
    * Dispara projéteis na vertical com um intervalo fixo de tempo;
    * Possui um contador de pontos na tela; 
    * Possui um medidor de integridade na tela:
        * Caso colida com um asteróide, a nave perde integridade;
        * Caso a integridade atinja 0 ou menos, voltar para o menu principal.
* Asteroides:
    * São criados aleatoriamente nas bordas da tela de acordo com o tempo
    * Devem possuir tamanhos aleatórios
    * Devem ser destruídos caso saiam das bordas da tela
    * Caso colida com um projétil da nave, aumenta a pontuação do jogador e é destruído

*:pushpin: Requisitos desejáveis*

* Deve se adaptar à taxa de quadros de computadores com velocidades diferentes;
* Nave:
    * Dano na integridade é proporcional ao tamanho do asteróide;
    * Dispara manualmente os projéteis, respeitando o intervalo de tempo.
    * Caso a integridade atinja 0 ou menos, salvar pontuação caso ela seja maior que a melhor pontuação anterior.
* Asteroides:
    * Possui resistência aos projéteis de acordo com o seu tamanho. Quanto maior, mais difícil de destruir;
    * Caso a resistência atinja 0 ou menos:
        * Se o asteróide for grande, é dividido em asteróides menores
        * Se for pequeno, é vaporizado

**:bar_chart: Menu**

É a tela inicial. Nela mostraremos opções relacionadas ao jogo.

*:pushpin: Requisitos mínimos*:

* Título com o nome do jogo
* Botão para iniciar a fase
* Botão para ir para a tela de créditos

*:pushpin: Requisitos desejáveis*

* Botão para mostrar instruções do jogo
* Texto com maior pontuação atingida ou tela com tabela de nomes e pontuações

**:bar_chart: Tela de créditos**

É a tela na qual mostraremos as informações dos desenvolvedores do jogo.

*:pushpin: Requisitos mínimos*:

* Botão de voltar para o menu principal
* Lista com os nomes dos desenvolvedores do projeto
* Texto com link para o projeto do GitHub

*:pushpin: Requisitos desejáveis*

* Ao clicar no texto com o link para o projeto do GitHub, abrir uma nova aba com o link do projeto
* Ao clicar no nome de um desenvolvedor, abrir uma nova aba no perfil do usuário do Github desse desenvolvedor 
