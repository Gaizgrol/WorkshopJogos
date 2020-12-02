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

        return delta;
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
    constructor( text, size, x, y, actionCallback = () => {} )
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
        Game.render.fillText( "Salve", 30, 60 );

        // Botões
        this._buttons.forEach( button => button.draw() );

        // Botão selecionado
        Game.render.fillRect( 10, 120 + 32 * this._selectedButton, 8, 8 );
    }

    // Seleciona as opções
    step()
    {
        if ( Game.keyClicked["ArrowUp"] )
            this._selectedButton = ( this._buttons.length + this._selectedButton - 1 ) % this._buttons.length;
        if ( Game.keyClicked["ArrowDown"] )
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
    constructor()
    {
        super( "Menu", 32, [
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
        ]);


        let hs = localStorage.getItem("highscore");

        this.highscore = hs ?? 0;
    }

    draw()
    {
        // Desenha normalmente
        super.draw();

        // Desenha o link do projeto
        Game.render.font = "12px Arial";
        Game.render.fillText( `Melhor pontuação: ${this.highscore}`, 30, 280 );
    }
}

// Créditos do jogos
class Credits extends OptionSelect
{
    constructor()
    {
        super( "Créditos", 24, [
            // Desenvolvedor do jogo
            new Button( "Gabriel Izoton: github.com/Gaizgrol", 14, 30, 128, () => {
                window.open( "https://github.com/Gaizgrol" );
            }),

            // Ao clicar em voltar, vai para o menu
            new Button( "< Voltar", 14, 30, 160, () => {
                Game.clear();
                Game.createObject( new Menu() );
            }),
        ]);
    }

    draw()
    {
        // Desenha normalmente
        super.draw();

        // Desenha o link do projeto
        Game.render.font = "12px Arial";
        Game.render.fillText( "Código fonte:", 30, 260 );
        Game.render.fillStyle = "#00FF00";
        Game.render.fillText( "github.com/Gaizgrol/WorkshopJogos", 30, 280 );
    }
}

// Fase dos asteroides
class Space extends GameObject
{
    constructor()
    {
        super();

        // Maior intevalo possível entre criação de asteroides
        this._maxFramesUntilSpawn = 40;
        this._framesLeft = 0;

        Game.createObject( new Spaceship( Game.canvas.width/2, Game.canvas.height/2 ) );
    }

    // Cria um novo asteroide
    _createAsteroid()
    {
        let asteroidX = Math.round( Math.random() * Game.canvas.width );
        let asteroidSize = Math.round( 1 + Math.random() * 3 );
        let vx = Math.round( ( -3 + Math.random() * 6 ) / 2 );
        let vy = Math.round( ( 1 + Math.random() * 2 ) / 2 );
        Game.createObject( new Asteroid( asteroidX, 0, vx, vy, asteroidSize ) );
    }

    // Reinicia o contador
    _resetCounter()
    {
        let baseFrames = this._maxFramesUntilSpawn / 3;
        let remainingFrames = this._maxFramesUntilSpawn - baseFrames;
        this._framesLeft = baseFrames + Math.round( Math.random() * remainingFrames );
    }

    step()
    {
        if ( this._framesLeft <= 0 )
        {
            this._resetCounter();
            this._createAsteroid();
        }
        else
            // Diminui o contador
            this._framesLeft--;
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
        this.speed = 6;
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

    step()
    {
        // Move
        this.y -= this.speed;

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
        this.speed = 3;
        this.score = 0;

        // Intervalo máximo entre os disparos
        this._shotInterval = 15;
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
            this.score++;
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

    _move()
    {
        // Atualização do jogador
        if ( Game.keyPressed["ArrowUp"] == true )
            this.y -= this.speed;
        if ( Game.keyPressed["ArrowDown"] == true )
            this.y += this.speed;
        if ( Game.keyPressed["ArrowLeft"] == true )
            this.x -= this.speed;
        if ( Game.keyPressed["ArrowRight"] == true )
            this.x += this.speed;
    }

    _shoot()
    {
        if ( this._cooldown <= 0 )
        {
            // Reinicia o contador
            this._cooldown = this._shotInterval;
            // Cria um novo projétil
            Game.createObject( new Projectile( this.x, this.y - 8, 8, 12, this ) );
        }
        else
            this._cooldown--;
    }

    destroy()
    {
        // Destrói os colisores quando for destruído
        for ( let c of this._colliders )
            Game.destroyObject( c.collider._id );
    }
    
    draw()
    {
        this._drawShip();
        this._drawIntegrity();
        this._drawScore();
    }

    step()
    {
        if ( this.integrity <= 0 )
        {
            // Salva a melhor pontuação
            let hs = localStorage.getItem( "highscore" ) ?? 0;
            if ( this.score >= hs )
                localStorage.setItem( "highscore", this.score );

            Game.clear();
            Game.createObject( new Menu() );
        }

        this._shoot();

        // Última posição
        let lastX = this.x;
        let lastY = this.y;

        this._move();

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
        this.maxDamageFrameTime = 8;
        this.cooldown = 0;
    }

    _isOutside()
    {
        return ( this.x < 0 || this.x > Game.canvas.width || this.y < 0 || this.y > Game.canvas.height );
    }
    
    draw()
    {
        if ( this.resistance > 0 )
        {
            Game.render.fillStyle = ( this.cooldown == 0 ) ? "#007FFF" : "#FF00FF";
            Game.render.fillRect( this.x, this.y, this.size*8, this.size*8 );
        }
    }

    onCollision( other )
    {
        if ( other.tag == "Projectile" )
        {
            this.resistance--;

            this.cooldown = this.maxDamageFrameTime;
            
            if ( this.resistance <= 0 )
            {
                let l = Math.trunc( this.size / 2 );
                for ( let i = 0; i < 4; i++ )
                {
                    if ( l >= 1 )
                    {
                        let vx = -2 + Math.random() * 4;
                        vx = Math.sign( vx ) * Math.min( 0.25, Math.abs(vx) );
                        let vy = -2 + Math.random() * 4;
                        vy = Math.sign( vy ) * Math.min( 0.25, Math.abs(vy) );

                        let px = i % 2 ? -1 : 1;
                        let py = i > 2 ? -1 : 1;

                        Game.createObject( new Asteroid( this.x+px*l*4, this.y+py*l*4, this.vx+vx, this.vy+vy, l ) );
                    }
                }
                other.owner.score++;
            }
        }

        if ( other.tag == "Player" )
            Game.destroyObject( this._id );
    }

    step()
    {
        this.x += this.vx;
        this.y += this.vy;

        // Teste de limites
        if ( this._isOutside() || this.resistance <= 0 )
            Game.destroyObject( this._id );

        if ( this.cooldown > 0 )
            this.cooldown--;
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