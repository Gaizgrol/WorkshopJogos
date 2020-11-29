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
    step() {}
}

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
    static _keyClicked = {};

    // Objetos a serem criados
    static _create = [];
    // Objetos ativos
    static _objects = [];
    // IDs de objetos que serão destruídos
    static _destroy = new Set();

    // Controla a execução
    static _running = false;

    // Controle de quadros por segundo
    static _fps = 30;

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

    // Roda antes das atualizações
    static _createObjects()
    {
        // Adiciona os elementos a serem criados no final dos objetos ativos
        Game._objects = [ ...Game._objects, ...Game._create ];
        // Limpa o array
        Game._create = [];
    }

    // Roda depois das atualizações
    static _destroyObjects()
    {
        for ( let id of Game._destroy )
        {
            // Encontra o índice do objeto que possui este id nos objetos ativos
            let index = Game._objects.map( o => o.id ).indexOf( id );
            // Remove o objeto caso seja encontrado
            Game._objects.splice( index, ( index > -1 ) ? 1 : 0 );
        }
        // Limpa o conjunto
        Game._destroy.clear();
    }

    // Desenha os objetos ativos
    static _draw()
    {
        Game._objects.forEach( obj => obj.draw() );
    }

    // Ativa tecla apertada
    static _handleKeyDown( event )
    {
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
            Game._createObjects();
            Game._step();
            Game._draw();
            Game._destroyObjects();

            setTimeout( Game._loop, 1000/Game._fps );
        }
    }

    // Atualiza os objetos ativos
    static _step()
    {
        // Atualiza as teclas clicadas
        for ( let key in Game._keyPressed )
            Game._keyClicked[key] = ( Game._keyPressed[key] && !Game._keyClicked[key] )

        Game._objects.forEach( obj => obj.step() );
    }

    // Limpa o jogo
    static clear()
    {
        Game._create = [];
        Game._objects = [];
        Game._destroy.clear();
    }

    // Cria um objeto
    static createObject( obj )
    {
        Game._create.push( obj );
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

// Botões
class Button extends GameObject
{
    constructor( text, size, actionCallback, x, y )
    {
        super( x, y );
        this._text = text;
        this._size = size;
        this._actionCallback = actionCallback;
    }

    select()
    {
        this._actionCallback();
    }

    draw()
    {
        Game.render.fillStyle = "#FFF";
        Game.render.font = `${this._size}px Arial`;
        Game.render.fillText( this._text, this.x, this.y );
    }
}

// Menu do jogo
class Menu extends GameObject
{
    constructor()
    {
        super();

        this._selectedButton = 0;
        
        // Botões do menu
        this._buttons =
        [
            // Ao clicar em jogar, vai para a fase do espaço
            new Button( "Jogar", 14, () =>
                {
                    Game.clear();
                    Game.createObject( new Space() );
                },
            30, 128 ),

            // Ao clicar em créditos, vai para a fase dos créditos
            new Button( "Créditos", 14, () =>
                {
                    Game.clear();
                    Game.createObject( new Credits() );
                },
            30, 160 ),
        ];
    }

    draw()
    {
        // Plano de fundo
        Game.render.fillStyle = "#000";
        Game.render.fillRect( 0, 0, Game.canvas.width, Game.canvas.height );

        // Título
        Game.render.font = "32px Arial";
        Game.render.fillStyle = "#FFF";
        Game.render.fillText( "Salve", 30, 60 );

        // Botões
        this._buttons.forEach( button => button.draw() );

        // Botão selecionado
        Game.render.fillRect( 10, 120 + 32 * this._selectedButton, 8, 8 );
    }

    step()
    {
        if ( Game.keyClicked["ArrowUp"] )
            this._selectedButton = ( this._buttons.length + this._selectedButton - 1 ) % this._buttons.length;
        if ( Game.keyClicked["ArrowDown"] )
            this._selectedButton = ( this._selectedButton + 1 ) % this._buttons.length;
    }
}

// Roda o jogo após o DOM carregar
document.addEventListener( "DOMContentLoaded", () =>
    {
        Game.registerListeners();
        Game.setRenderTarget( document.getElementById("gameScreen") );
        Game.createObject( new Menu() );
        Game.run();
    }
);