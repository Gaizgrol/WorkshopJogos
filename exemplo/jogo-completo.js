// =======================================================================
//                          MOTOR DE JOGO

// Classe principal do jogo
class Game
{
    // Elemento alvo dos desenhos
    /**@type HTMLCanvasElement*/
    static canvas = null;

    // Ferramenta para desenhar no elemento alvo
    /**@type CanvasRenderingContext2D*/
    static render = null;

    // Obs: Coloquei anotações de tipo para o editor de código mostrar as
    // funções corretas na sugestão de código

    // Controle pra registrar os eventos só uma vez
    static _registeredListeners = false;

    // Dicionário para saber se uma tecla está sendo segurada
    static _keyPressed = {};

    // Dicionários para saber se uma tecla foi clicada (um disparo por aperto)
    static _keyAlreadyClicked = {};
    static _keyClicked = {};

    // Objetos a serem criados
    static _create = [];
    // Objetos que podem colidir
    static _colliders = [];
    // Objetos ativos
    static _objects = [];
    // IDs de objetos que serão destruídos
    static _destroy = new Set();

    // Controla a execução
    static _running = false;
    // Controla o tempo entre um quadro e outro
    static _lastFrame = 0;

    // Getter que retorna uma cópia das teclas de input para evitar
    // alterações indesejadas
    static get keyClicked()
    {
        return { ...Game._keyClicked };
    }

    // Getter que retorna uma cópia das teclas de input para evitar
    // alterações indesejadas
    static get keyPressed()
    {
        return { ...Game._keyPressed };
    }

    // Confere se objetos colidiram
    static _checkCollisions()
    {
        for ( let i = 0; i < Game._colliders.length - 1; i++ )
        {
            for ( let j = i+1; j < Game._colliders.length; j++ )
            {
                let collider1 = Game._colliders[i];
                let collider2 = Game._colliders[j];

                // Se colidiram entre si, execute seus métodos passando o colisor oposto como parâmetro
                if ( Collider.boxIntersection( collider1.x, collider1.y, collider1.width, collider1.height,
                                               collider2.x, collider2.y, collider2.width, collider2.height ) )
                {
                    collider1.onCollision( collider2 );
                    collider2.onCollision( collider1 );
                }
            }
        }
    }

    // Roda antes das atualizações
    static _createObjects()
    {
        // Adiciona os elementos a serem criados no final dos objetos ativos
        for ( let obj of Game._create )
        {
            Game._objects.push( obj );

            if ( obj instanceof Collider )
                Game._colliders.push( obj );
        }

        // Limpa o array
        Game._create = [];
    }

    // Roda depois das atualizações
    static _destroyObjects()
    {
        for ( let id of Game._destroy )
        {
            // Encontra o índice do objeto que possui este id nos objetos ativos
            let index = Game._objects.map( o => o._id ).indexOf( id );
            // Remove o objeto caso seja encontrado
            let [ removed ] = Game._objects.splice( index, ( index > -1 ) ? 1 : 0 );
            // Executa limpeza
            if ( removed )
                removed.destroy();

            // Caso seja um colisor, remova da lista de colisores também
            if ( removed instanceof Collider )
            {
                // Encontra o índice do objeto que possui este id nos colisores ativos
                let indexCollider = Game._colliders.map( o => o._id ).indexOf( removed._id );
                // Remove o colisor caso seja encontrado
                let [ removedCollider ] = Game._colliders.splice( indexCollider, ( indexCollider > -1 ) ? 1 : 0 );
                // Executa limpeza
                if ( removedCollider )
                    removedCollider.destroy();
            }
        }
        // Limpa o conjunto
        Game._destroy.clear();
    }

    // Desenha os objetos ativos
    static _draw()
    {
        // Plano de fundo
        Game.render.fillStyle = "#000";
        Game.render.fillRect( 0, 0, Game.canvas.width, Game.canvas.height );

        Game._objects.forEach( obj => obj.draw() );
    }

    // Cuida da atualização de tempo entre os quadros do jogo
    static _handleDelta()
    {
        let delta = 16;
        
        // Calcula a diferença de tempo
        if ( Game._lastFrame > 0 )
        {
            let lastFrame = Game._lastFrame;
            let now = Date.now();
            
            delta = now - lastFrame;
        }
        Game._lastFrame = Date.now();

        return delta / 1000;
    }

    // Atualiza as teclas clicadas (dispara uma vez por clique)
    static _handleKeyClicked()
    {
        for ( let key in Game._keyPressed )
        {
            if ( Game._keyPressed[key] )
            {
                if ( !Game._keyAlreadyClicked[key] )
                {
                    Game._keyClicked[key] = true;
                    Game._keyAlreadyClicked[key] = true;
                }
                else
                    Game._keyClicked[key] = false;
            }
            else
            {
                Game._keyClicked[key] = false;
                Game._keyAlreadyClicked[key] = false;
            }
        }
    }

    // Ativa tecla apertada
    static _handleKeyDown( event )
    {
        event.preventDefault();
        Game._keyPressed[ event.key ] = true;
    }

    // Desativa tecla apertada
    static _handleKeyUp( event )
    {
        Game._keyPressed[ event.key ] = false;
    }

    // Laço principal do jogo
    static _loop()
    {
        if ( Game._running )
        {
            let delta = Game._handleDelta();

            Game._createObjects();
            Game._step( delta );
            Game._checkCollisions();
            Game._draw();
            Game._destroyObjects();

            requestAnimationFrame( Game._loop );
        }
        else
        {
            Game._lastFrame = 0;
        }
    }

    // Atualiza os objetos ativos
    static _step( delta )
    {
        Game._handleKeyClicked();
        Game._objects.forEach( obj => obj.step( delta ) );
    }

    // Limpa o jogo
    static clear()
    {
        Game._create = [];
        Game._objects = [];
        Game._colliders= [];
        Game._destroy.clear();
    }

    // Cria um objeto
    static createObject( obj )
    {
        Game._create.push( obj );
        return obj;
    }

    // Remove um objeto
    static destroyObject( id )
    {
        Game._destroy.add( id );
    }

    // Escuta os eventos do teclado
    static registerListeners()
    {
        if ( !Game._registeredListeners )
        {
            document.addEventListener( "keydown", Game._handleKeyDown );
            document.addEventListener( "keyup", Game._handleKeyUp );
            Game._registeredListeners = true;
        }
    }

    // Começa a rodar o jogo
    static run()
    {
        if ( !Game._running )
        {
            Game._running = true;
            Game._loop();
        }
    }

    // Para de rodar o jogo
    static stop()
    {
        Game._running = false;
    }

    // Configura qual o elemento alvo dos desenhos
    static setRenderTarget( canvas )
    {
        Game.canvas = canvas;
        Game.render = canvas.getContext("2d");
    }
}

// =======================================================================
//                    OBJETOS GENÉRICOS DO MOTOR

// Classe genérica de objeto de jogo
class GameObject
{
    static _nextID = 0;
    
    constructor( x = 0, y = 0 )
    {
        this.x = x;
        this.y = y;
        this._id = GameObject._nextID++;
    }

    draw() {}
    step( delta ) {}
    destroy() {}
}

// Classe de objetos que colidem
class Collider extends GameObject
{
    // Função para detectar colisões entre retângulos
    // ax, ay -> coordenadas do retângulo A | aw, ah -> largura e altura do retângulo A
    // bx, by -> coordenadas do retângulo B | bw, bh -> largura e altura do retângulo B
    static boxIntersection( ax, ay, aw, ah, bx, by, bw, bh )
    {
        return !(ax > bx+bw || ax+aw < bx || ay > by+bh || ay+ah < by);
    }

    onCollision( other )
    {
        this.collisionCallback( other );
    }

    constructor( x, y, w, h, tag = "Collider", collisionCallback = () => {} )
    {
        super( x, y );
        this.width = w;
        this.height = h;
        this.tag = tag;
        this.collisionCallback = collisionCallback;
    }
}

// =======================================================================
//                    OBJETOS GENÉRICOS DO JOGO

// Botões
class Button extends GameObject
{
    constructor( text, size, x, y, actionCallback = () => {}, color = "#FFF" )
    {
        super( x, y );
        this._text = text;
        this._size = size;
        this._actionCallback = actionCallback;
        this._color = color;
    }

    select()
    {
        this._actionCallback();
    }

    draw()
    {
        Game.render.fillStyle = this._color;
        Game.render.font = `${this._size}px Arial`;
        Game.render.fillText( this._text, this.x, this.y );
    }
}

// Menu do jogo
class OptionSelect extends GameObject
{
    constructor( title, size, buttons )
    {
        super();

        this._title = title;
        this._size = size;
        this._selectedButton = 0;
        
        // Botões do menu
        this._buttons = buttons
    }

    draw()
    {
        // Título
        Game.render.font = `${this._size}px Arial`;
        Game.render.fillStyle = "#FFF";
        Game.render.fillText( this._title, 30, 60 );

        // Botões
        this._buttons.forEach( button => button.draw() );

        // Botão selecionado
        let selected = this._buttons[ this._selectedButton ];
        Game.render.fillRect( selected.x - 18, selected.y - 8, 8, 8 );
    }

    // Seleciona as opções
    step()
    {
        if ( Game.keyClicked["ArrowUp"] || Game.keyClicked["ArrowLeft"] )
            this._selectedButton = ( this._buttons.length + this._selectedButton - 1 ) % this._buttons.length;
        if ( Game.keyClicked["ArrowDown"] || Game.keyClicked["ArrowRight"] )
            this._selectedButton = ( this._selectedButton + 1 ) % this._buttons.length;
        if ( Game.keyClicked[" "] )
            this._buttons[ this._selectedButton ].select();
    }
}

// =======================================================================
//                          SALAS DE JOGO

// Menu principal
class Menu extends OptionSelect
{
    constructor( selected = 0 )
    {
        super( "Salve", 32, [
            // Ao clicar em jogar, vai para a fase do espaço
            new Button( "Jogar", 14, 30, 128, () => {
                Game.clear();
                Game.createObject( new Space() );
            }),

            // Ao clicar em créditos, vai para a fase dos créditos
            new Button( "Créditos", 14, 30, 160, () => {
                Game.clear();
                Game.createObject( new Credits() );
            }),

            // Ao clicar em créditos, vai para a fase dos créditos
            new Button( "Ajuda", 14, 30, 192, () => {
                Game.clear();
                Game.createObject( new Help() );
            }),

            // Ao clicar em créditos, vai para a fase dos créditos
            new Button( "Placar", 14, 30, 224, () => {
                Game.clear();
                Game.createObject( new Highscores() );
            }),
        ]);

        this._selectedButton = selected;
    }
}

// Fase dos asteroides
class Space extends GameObject
{
    constructor()
    {
        super();

        // Maior intevalo possível entre criação de asteroides
        this._maxFramesUntilSpawn = 666;
        this._framesLeft = 0;

        Game.createObject( new Spaceship( Game.canvas.width/2, Game.canvas.height/2 ) );
    }

    // Cria um novo asteroide
    _createAsteroid()
    {
        let asteroidX = Math.round( Math.random() * Game.canvas.width );
        let asteroidSize = Math.round( 1 + Math.random() * 3 );
        let vx = Math.round( ( -180 + Math.random() * 360 ) / 2 );
        let vy = Math.round( ( 60 + Math.random() * 120 ) / 2 );
        Game.createObject( new Asteroid( asteroidX, 0, vx, vy, asteroidSize ) );
    }

    // Reinicia o contador
    _resetCounter()
    {
        let baseFrames = this._maxFramesUntilSpawn / 3;
        let remainingFrames = this._maxFramesUntilSpawn - baseFrames;
        this._framesLeft = baseFrames + Math.round( Math.random() * remainingFrames );
    }

    step( deltaTime )
    {
        if ( this._framesLeft <= 0 )
        {
            this._resetCounter();
            this._createAsteroid();
        }
        else
            // Diminui o contador
            this._framesLeft -= deltaTime * 1000;
    }
}

// Créditos do jogos
class Credits extends OptionSelect
{
    constructor()
    {
        super( "Créditos", 24, [
            // Desenvolvedor do jogo
            new Button( "Gabriel Izoton", 14, 30, 128, () => {
                window.open( "https://github.com/Gaizgrol" );
            }),

            // Link do projeto
            new Button( "https://github.com/Gaizgrol/WorkshopJogos", 12, 30, 224, () => {
                window.open( "https://github.com/Gaizgrol/WorkshopJogos" );
            }, "#0F0"),

            // Ao clicar em voltar, vai para o menu
            new Button( "< Voltar", 14, 30, 256, () => {
                Game.clear();
                Game.createObject( new Menu(1) );
            }),
        ]);
    }

    draw()
    {
        super.draw();

        // Título do conteúdo
        Game.render.font = "18px Arial";
        Game.render.fillStyle = "#FF0"
        Game.render.fillText( "Desenvolvedores:", 30, 96 )
    }
}

// Créditos do jogos
class Help extends OptionSelect
{
    constructor()
    {
        super( "Ajuda", 24, [
            // Volta o texto
            new Button( "Anterior", 12, 30, 224, () => {
                let pages = this._getTotalPages();
                this._page = ( pages + this._page - 1 ) % pages;
            }, "#0F0"),

            // Avança o texto
            new Button( "Próximo", 12, 224, 224, () => {
                let pages = this._getTotalPages();
                this._page = ( this._page + 1 ) % pages;
            }, "#0F0"),

            // Ao clicar em voltar, vai para o menu
            new Button( "< Voltar", 14, 30, 256, () => {
                Game.clear();
                Game.createObject( new Menu(2) );
            }),
        ]);

        this._selectedButton = 1;

        this._linesPerScreen = 3;

        this._page = 0;
        this._content = [
            {
                title: "Movimentação:",
                info: [
                    "Utilize as setas do teclado para se",
                    "mover, segure espaço para disparar."
                ]
            },
            {
                title: "Nave:",
                info: [
                    "A sua nave possui uma integridade",
                    "limitada: ao ser atingida por um",
                    "asteroide, ela sofrerá danos",
                    "irreversíveis! Quando o medidor de",
                    "integridade atingir 0, sua pontuação",
                    "será registrada caso esteja entre as",
                    "10 melhores."
                ]
            },
            {
                title: "Asteroides:",
                info: [
                    "Asteroides possuem uma resistência",
                    "proporcional ao seu tamanho. Dispare",
                    "nos asteroides para fragmentá-los em",
                    "pedaços menores. Quando asteroides",
                    "pequenos são atingidos, eles são",
                    "vaporizados instantaneamente."
                ]
            }
        ];
    }

    _getTotalPages()
    {
        return this._content.reduce( (pgs, c) => pgs + Math.ceil( c.info.length / this._linesPerScreen ), 0 );
    }

    draw()
    {
        super.draw();

        // Dados do conteúdo atual
        let actualContent = 0;
        let actualContentFirstPage = 0;
        let actualContentLastPage = 0;

        // Busca o conteúdo atual
        this._content.reduce( ( pages, content, contentIndex ) => {
            
            // Qual o índice da última página do conteúdo
            let lastPage = pages + Math.ceil( content.info.length / this._linesPerScreen );

            // Se a página selecionada estiver entre a primeira e última página
            // do conteúdo, então o conteúdo atual é este.
            if ( this._page >= pages && this._page <= lastPage )
            {
                actualContent = contentIndex;
                actualContentFirstPage = pages;
                actualContentLastPage = lastPage;
            }

            return lastPage;

        }, 0 );

        // Quantidade de páginas do conteúdo atual
        let actualContentNumPages = actualContentLastPage - actualContentFirstPage;
        let actualContentPage = this._page - actualContentFirstPage;
        let content = this._content[ actualContent ];

        // Título do conteúdo
        Game.render.font = "18px Arial";
        Game.render.fillStyle = "#FF0"
        Game.render.fillText( content.title, 30, 96 )
        
        // Índice do conteúdo
        Game.render.textAlign = "end";
        Game.render.fillText(`(${actualContent+1}/${this._content.length})`, 270, 96);
        
        // Índice da página de informações do conteúdo
        Game.render.font = "14px Arial";
        Game.render.fillStyle = "#0F0"
        Game.render.textAlign = "center";
        Game.render.fillText( `(${actualContentPage+1}/${actualContentNumPages})`, 150, 224 )

        // Desenha as linhas de informação
        Game.render.font = "14px Arial";
        Game.render.fillStyle = "#FFF"
        Game.render.textAlign = "start";
        for ( let i = 0; i < this._linesPerScreen && ( actualContentPage * this._linesPerScreen + i < content.info.length ) ; i++ )
        {
            let contentLines = content.info.length;
            let lineIndex = Math.min( contentLines - 1, actualContentPage * this._linesPerScreen + i );
            Game.render.fillText( content.info[ lineIndex ], 30, 128 + 24*i )
        }
    }
}

// Créditos do jogos
class Highscores extends OptionSelect
{
    constructor( score = -1 )
    {
        super( "Placar", 24, [
            // Ao clicar em voltar, vai para o menu
            new Button( "< Voltar", 14, 30, 256, () => {
                Game.clear();
                Game.createObject( new Menu(3) );
            }),
        ]);

        
        let scores = localStorage.getItem("highscores");

        // Se não temos placar, geramos um novo
        if ( !scores )
        {
            scores = this._clearScores();
            localStorage.setItem( "highscores", JSON.stringify(scores) );
        }

        // Se o placar armazenado tem algum problema de conversão, gera um novo
        try
        {
            scores = JSON.parse( scores );
        } catch
        {
            scores = this._clearScores();
            localStorage.setItem( "highscores", JSON.stringify(scores) );
        }

        // Pontuações
        this._highscores = scores.sort( ( a, b ) => b.score - a.score );
        
        // Controle da edição do novo nome
        this._isEditing = false;
        this._promptIndex = 0;
        this._promptShow = true;
        this._promptMaxTime = 333;
        this._promptTimer = this._promptMaxTime;
        
        // Controle da nova entrada no placar
        this._newEntryName = this._getDefaultName();
        this._newEntryScore = score;
        this._newEntryPlace = 0;
        
        // Controle de primeiro placar na tela e quantidade de placares na tela
        this._scoreAnchorIndex = 0;
        this._scoresOnScreen = 4;

        // Se recebemos uma pontuação, buscamos a menor pontuação do placar
        if ( score > 0 )
        {
            let min = Infinity;
            for ( let entry of this._highscores )
                min = ( entry.score < min ) ? entry.score : min;
    
            // Inserimos a nova pontuação no placar caso a nova pontuação seja maior que a menor pontuação
            if ( score > min )
            {
                this._isEditing = true;
                
                // Encontra a posição da nova entrada
                for ( let i = 0; i < this._highscores.length; i++ )
                    if ( score <= this._highscores[i].score )
                        this._newEntryPlace = i + 1;

                // 15 10 7 6 6 5

                // Insere nova pontuação na posição nova e remove a última
                this._highscores.splice( this._newEntryPlace, 0, { name: this._getDefaultName(" "), score } );
                this._highscores.pop();

                // Move a "câmera" para a nova entrada no placar
                this._scoreAnchorIndex = Math.min( this._highscores.length - this._scoresOnScreen, this._newEntryPlace );
            }
        }
    }

    _clearScores()
    {
        let newScore = [];

        // Gera o placar padrão
        for ( let i = 0; i < 10; i++ )
        {
            newScore.push({
                name: this._getDefaultName(),
                score: 0
            });
        }

        return newScore;
    }

    _getDefaultName( char = "-" )
    {
        let defaultName = "";
        for ( let i = 0; i < 10; i++ )
            defaultName += char;
        return defaultName;
    }

    _refreshPrompt()
    {
        // Reseta o prompt para o estado visível
        this._promptTimer = this._promptMaxTime;
        this._promptShow = true;
    }

    _seekLeft()
    {
        this._promptIndex = Math.max( 0, this._promptIndex - 1 );
    }

    _seekRight()
    {
        this._promptIndex = Math.min( this._newEntryName.length - 1, this._promptIndex + 1 );
    }

    _setEntryNameChar( char )
    {
        // Nome antigo
        let name = this._highscores[ this._newEntryPlace ].name;

        let newName = name.substring( 0, this._promptIndex );
        newName += String.fromCharCode( char );
        newName += name.substring( this._promptIndex + 1 );
                        
        // Altera a letra atual para a que foi apertada e pula para a próxima letra
        this._highscores[ this._newEntryPlace ].name = newName; 
    }

    draw()
    {
        super.draw();
        
        // Título do conteúdo
        Game.render.font = "18px Arial";
        Game.render.fillStyle = "#FF0"
        Game.render.fillText( "Top 10:", 30, 96 )

        // Barra lateral
        let barStart = 110;
        let barSize = 110;
        
        Game.render.strokeStyle = "#FFF";
        Game.render.strokeRect( 256, barStart, 14, barSize );
        Game.render.fillStyle = "#FFF";
        Game.render.fillRect( 256, barStart + this._scoreAnchorIndex*(barSize/this._highscores.length), 14, (this._scoresOnScreen/this._highscores.length) * barSize );
        
        // Placares
        for ( let i = 0; i < this._scoresOnScreen; i++ )
        {
            Game.render.font = "14px Arial";
            Game.render.textAlign = "end";
            Game.render.fillStyle = "#0F0";
            // Colocação
            Game.render.fillText( this._scoreAnchorIndex + i + 1, 40, 128 + i*32 );
            // Pontuação
            Game.render.fillText( this._highscores[ this._scoreAnchorIndex + i ].score, 224, 128 + i*32 );
            
            // Nome
            Game.render.textAlign = "start";
            
            let spacing = 12;
            let name = this._highscores[ this._scoreAnchorIndex + i ].name;
            for ( let j = 0; j < name.length; j++ )
            {
                // Desenha a letra amarela caso esteja editando
                if ( this._isEditing && this._newEntryPlace == i + this._scoreAnchorIndex && this._promptIndex == j )
                {
                    Game.render.fillStyle = "#FF0";
                    // Desenha o prompt embaixo
                    if ( this._promptShow )
                        Game.render.fillRect( 64 + spacing*j - 2, 132 + i*32, spacing - 2, 1 );
                }
                // Se não estiver editando ou não estiver selecionada, desenha normalmente
                else
                    Game.render.fillStyle = "#FFF";
                
                let letter = name[j];
                Game.render.fillText( letter, 64 + spacing*j, 128 + i*32 );
            }
        }
    }
    
    step( deltaTime )
    {
        // Caso não esteja editando a nova pontuação, navegue pela tabela
        if ( !this._isEditing )
        {
            if ( Game.keyClicked[" "] )
            {
                Game.clear();
                Game.createObject( new Menu(3) );
            }
            if ( Game.keyClicked["ArrowUp"] )
                this._scoreAnchorIndex = Math.max( 0, this._scoreAnchorIndex - 1 );
            if ( Game.keyClicked["ArrowDown"] )
                this._scoreAnchorIndex = Math.min( this._highscores.length - this._scoresOnScreen, this._scoreAnchorIndex + 1 );
        }
        else
        {
            // Escreve o nome na linha

            // Intervalo de caracteres aceitos
            let acceptedCharsRanges = [
                [ "0".charCodeAt(0), "9".charCodeAt(0) ],
                [ "A".charCodeAt(0), "Z".charCodeAt(0) ],
                [ "-".charCodeAt(0), "-".charCodeAt(0) ],
                [ " ".charCodeAt(0), " ".charCodeAt(0) ],
            ];
            for ( let key in Game.keyClicked )
            {
                // Se a tecla foi apertada e é uma letra/número
                if ( Game.keyClicked[key] && key.length == 1 )
                {
                    // Salva somente as letras em caixa alta
                    let upKey = key.toUpperCase().charCodeAt(0);
                    
                    // Testa se o caracter está na gama de caracteres aceitos
                    let inAnyRange = false

                    for ( let range of acceptedCharsRanges )
                    {
                        if ( upKey >= range[0] && upKey <= range[1] )
                        {
                            inAnyRange = true;
                            break;
                        }
                    }

                    if ( inAnyRange )
                    {
                        this._refreshPrompt();

                        // Novo nome com a letra substituída
                        this._setEntryNameChar( upKey );

                        this._seekRight();
                    }
                }
            }

            // Piscada do cursor de texto
            if ( this._promptTimer <= 0 )
            {
                this._promptShow = !this._promptShow;
                this._promptTimer = this._promptMaxTime;
            }
            else
                this._promptTimer -= deltaTime * 1000;

            // "Apaga" letra atual
            if ( Game.keyClicked["Backspace"] )
            {
                this._refreshPrompt();
                this._setEntryNameChar(" ");
                this._seekLeft();
            }

            // Salva o placar novo
            if ( Game.keyClicked["Enter"] )
            {
                localStorage.setItem( "highscores", JSON.stringify( this._highscores ) );
                this._isEditing = false;
            }

            // Anda pra esquerda ou pra direita
            if ( Game.keyClicked["ArrowLeft"] )
            {
                this._refreshPrompt();
                this._seekLeft();
            }
            if ( Game.keyClicked["ArrowRight"] )
            {
                this._refreshPrompt()
                this._seekRight();
            }
        }
    }

}

// =======================================================================
//                    OBJETOS DA SALA DO ESPAÇO

// Projétil da nave
class Projectile extends Collider
{
    constructor( x, y, width, height, owner )
    {
        super( x, y, width, height, "Projectile" );
        this.speed = 360;
        this.owner = owner;
    }

    _isOutside()
    {
        return ( this.x < 0 || this.x > Game.canvas.width || this.y < 0 || this.y > Game.canvas.height );
    }

    draw()
    {
        Game.render.fillStyle = "#FFFF00";
        Game.render.fillRect( this.x - this.width/2, this.y - this.height/2, this.width, this.height );
    }

    onCollision( other )
    {
        if ( other.tag == "Asteroid" )
            Game.destroyObject( this._id );
    }

    step( deltaTime )
    {
        // Move
        this.y -= this.speed * deltaTime;

        // Teste de limites
        if ( this._isOutside() )
            Game.destroyObject( this._id );
    }
}

// Nave espacial
class Spaceship extends GameObject
{
    constructor( x, y )
    {
        super( x, y );

        // "Vida" da nave, velocidade e pontuação inicial
        this.integrity = 100;
        this.speed = 180;
        this.score = 0;

        // Intervalo máximo entre os disparos
        this._shotInterval = 166;
        this._cooldown = 0;

        // Cria dois colisores, já que a nave é irregular (composta por dois retângulos)
        this._colliders = [
            {
                offsetX: -12,
                offsetY: -8,
                collider: Game.createObject( new Collider( this.x-12, this.y-8, 24, 16, "Player", this._collision.bind(this) ) )
            },
            {
                offsetX: -6,
                offsetY: -24,
                collider: Game.createObject( new Collider( this.x-6, this.y-24, 12, 16, "Player", this._collision.bind(this) ) )
            }
        ];
        
    }

    _collision( other )
    {
        if ( other.tag == "Asteroid" )
        {
            this.integrity -= other.size*8;
            this.increaseScore();
        }
    }

    _drawIntegrity()
    {
        // Desenha integridade da nave
        if ( this.integrity > 70 )
            Game.render.fillStyle = "#00FF00";
        else if ( this.integrity > 50 )
            Game.render.fillStyle = "#FFFF00";
        else if ( this.integrity > 30 )
            Game.render.fillStyle = "#FF7F00";
        else
            Game.render.fillStyle = "#FF0000";

        Game.render.fillRect( 8, Game.canvas.height - 16, Math.max( 0, (Game.canvas.width - 16) * this.integrity/100 ), 8 );
    }

    _drawScore()
    {
        // Desenha pontuação
        Game.render.fillStyle = "#FFFFFF";
        Game.render.fillText( this.score, 8, 32 );
    }

    _drawShip()
    {
        // Desenha nave
        Game.render.fillStyle = "#FFFFFF";
        for ( let c of this._colliders )
            Game.render.fillRect( c.collider.x, c.collider.y, c.collider.width, c.collider.height );
    }

    _isOutside()
    {
        return ( this.x < 0 || this.x > Game.canvas.width || this.y < 0 || this.y > Game.canvas.height );
    }

    _move( deltaTime )
    {
        // Última posição
        let lastX = this.x;
        let lastY = this.y;

        // Atualização do jogador
        if ( Game.keyPressed["ArrowUp"] == true )
            this.y -= this.speed * deltaTime;
        if ( Game.keyPressed["ArrowDown"] == true )
            this.y += this.speed * deltaTime;
        if ( Game.keyPressed["ArrowLeft"] == true )
            this.x -= this.speed * deltaTime;
        if ( Game.keyPressed["ArrowRight"] == true )
            this.x += this.speed * deltaTime;

        // Teste de limites
        if ( this._isOutside() )
        {
            this.x = lastX;
            this.y = lastY;
        }
        else
        {
            // Atualiza a posição dos colisores
            for ( let c of this._colliders )
            {
                c.collider.x = this.x + c.offsetX;
                c.collider.y = this.y + c.offsetY;
            }
        }
    }

    _saveScore()
    {        
        // Salva a melhor pontuação
        let hs = localStorage.getItem( "highscore" ) ?? 0;
        if ( this.score >= hs )
            localStorage.setItem( "highscore", this.score );
    }

    _shoot( deltaTime )
    {
        if ( this._cooldown <= 0 )
        {
            if ( Game.keyPressed[" "] )
            {
                // Reinicia o contador
                this._cooldown = this._shotInterval;
                // Cria um novo projétil
                Game.createObject( new Projectile( this.x, this.y - 8, 8, 12, this ) );
            }
        }
        else
            this._cooldown -= deltaTime * 1000;
    }

    destroy()
    {
        // Destrói os colisores quando for destruído
        for ( let c of this._colliders )
            Game.destroyObject( c.collider._id );
    }
    
    draw()
    {
        // Desenha tudo relacionado à nave
        this._drawShip();
        this._drawIntegrity();
        this._drawScore();
    }

    increaseScore()
    {
        this.score++;
    }

    step( deltaTime )
    {
        // Testa se a nave ainda está inteira
        if ( this.integrity <= 0 )
        {
            this._saveScore();
            Game.clear();
            Game.createObject( new Highscores( this.score ) );
        }

        this._move( deltaTime );
        this._shoot( deltaTime );
    }
}

// Asteroide
class Asteroid extends Collider
{
    constructor( x, y, vx, vy, size )
    {
        super( x, y, size*8, size*8, "Asteroid" );
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.resistance = size;
        this.maxDamageFrameTime = 130;
        this.cooldown = 0;
    }

    _fragment()
    {
        // Tamanho dos novos asteroides
        let l = Math.trunc( this.size / 2 );
        
        for ( let i = 0; i < 4; i++ )
        {
            if ( l >= 1 )
            {
                // Velocidade do novo asteroide
                let vx = -120 + Math.random() * 240;
                vx = Math.sign( vx ) * Math.min( 15, Math.abs(vx) );
                let vy = -120 + Math.random() * 240;
                vy = Math.sign( vy ) * Math.min( 15, Math.abs(vy) );

                // Posição do novo asteroide
                let px = i % 2 ? -1 : 1;
                let py = i > 2 ? -1 : 1;

                Game.createObject( new Asteroid( this.x+px*l*4, this.y+py*l*4, this.vx+vx, this.vy+vy, l ) );
            }
        }
    }

    _isOutside()
    {
        return ( this.x < 0 || this.x > Game.canvas.width || this.y < 0 || this.y > Game.canvas.height );
    }
    
    draw()
    {
        if ( this.resistance > 0 )
        {
            Game.render.fillStyle = ( this.cooldown <= 0 ) ? "#007FFF" : "#FF00FF";
            Game.render.fillRect( this.x, this.y, this.size*8, this.size*8 );
        }
    }

    onCollision( other )
    {
        if ( other.tag == "Projectile" )
        {
            // Danifica o asteroide
            this.resistance--;
            // "Pisca" o asteroide
            this.cooldown = this.maxDamageFrameTime;
            
            // Testa se foi destruído
            if ( this.resistance <= 0 )
            {
                this._fragment();
                other.owner.increaseScore();
            }
        }

        // Na colisão com o jogador se destrói instantaneamente
        if ( other.tag == "Player" )
            Game.destroyObject( this._id );
    }

    step( deltaTime )
    {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        // Teste de limites
        if ( this._isOutside() || this.resistance <= 0 )
            Game.destroyObject( this._id );

        if ( this.cooldown > 0 )
            this.cooldown -= deltaTime * 1000;
    }
}

// =======================================================================
//                     INICIALIZAÇÃO DO MOTOR

// Roda o jogo após o DOM carregar
document.addEventListener( "DOMContentLoaded", () => {
    Game.registerListeners();
    Game.setRenderTarget( document.getElementById("gameScreen") );
    Game.createObject( new Menu() );
    Game.run();
});