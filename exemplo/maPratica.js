/**@type HTMLCanvasElement*/
let canvas = null;
/**@type CanvasRenderingContext2D*/
let render = null;

// Indicador da sala
let room = "menu";

// Sala do menu
let menu =
{
    buttons:
    [
        { text: 'Jogar', room: 'game' },
        { text: 'Créditos', room: 'credits' }
    ],
    selectedButton: 0
}

// Sala dos créditos
let credits =
{
    buttons:
    [
        { text: 'Gabriel Izoton: github.com/Gaizgrol', room: 'credits' },
        { text: '< Voltar', room: 'menu' }
    ],
    selectedButton: 0
}

// Sala do jogo
let game =
{
    player:
    {
        canShoot: true,
        x: 150,
        y: 250,
        integrity: 100,
        score: 0
    },
    projectiles: [],

    canSpawnAsteroid: true,
    asteroids: []
}

// "Dicionário" de teclas apertadas
let keyPressed = {}

// Roda o jogo somente após o DOM ter carregado
document.addEventListener("DOMContentLoaded", () => {
    
    // Busca os elementos na tela
    canvas = document.getElementById("gameScreen");
    render = canvas.getContext("2d");

    // Soltando a tecla
    document.addEventListener( "keyup", ( event ) => {
        if ( room == "game" )
            keyPressed[ event.key ] = false;
    });

    // Apertando a tecla
    document.addEventListener( "keydown", ( event ) => {
        // Renderiza de acordo com o nome da sala
        switch ( room )
        {
            case "game":
                event.preventDefault();
                keyPressed[ event.key ] = true;
                break;
            case "credits":
                switch ( event.key )
                {
                    // Sobe as opções
                    case "ArrowUp":
                        event.preventDefault();
                        credits.selectedButton = ( credits.buttons.length + credits.selectedButton - 1 ) % credits.buttons.length;
                        break;
                    // Desce as opções
                    case "ArrowDown":
                        event.preventDefault();
                        credits.selectedButton = ( credits.selectedButton + 1 ) % credits.buttons.length;
                        break;
                    case " ":
                        event.preventDefault();
                        room = credits.buttons[ credits.selectedButton ].room;
                        break;
                }
                break;
            default:
                switch ( event.key )
                {
                    // Sobe as opções
                    case "ArrowUp":
                        event.preventDefault();
                        menu.selectedButton = ( menu.buttons.length + menu.selectedButton - 1 ) % menu.buttons.length;
                        break;
                    // Desce as opções
                    case "ArrowDown":
                        event.preventDefault();
                        menu.selectedButton = ( menu.selectedButton + 1 ) % menu.buttons.length;
                        break;
                    case " ":
                        event.preventDefault();
                        room = menu.buttons[ menu.selectedButton ].room;
                        break;
                }
                break;
        }
    })

    main();
});

// Loop principal
function main()
{
    // Renderiza de acordo com o nome da sala
    switch ( room )
    {
        case "game":
            roomGame();
            break;
        case "credits":
            roomCredits();
            break;
        default:
            roomMenu();
            break;
    }
    requestAnimationFrame( main );
}

// Desenha o menu
function roomMenu()
{
    // Plano de fundo
    render.fillStyle = "#000000";
    render.fillRect( 0, 0, canvas.width, canvas.height );
    
    // Título
    render.font = "32px Arial";
    render.fillStyle = "#FFFFFF";
    render.fillText( "Salve", 30, 60 );

    // Botões
    render.font = "14px Arial"
    for ( let i = 0; i < menu.buttons.length; i++ )
    {
        render.fillText( menu.buttons[i].text, 30, 128 + 32*i );
        
        // Item selecionado
        if ( i == menu.selectedButton )
            render.fillRect( 10, 128 + 32*i - 8, 8, 8 );
    }
}

// Desenha os créditos
function roomCredits()
{
    // Plano de fundo
    render.fillStyle = "#000000";
    render.fillRect( 0, 0, canvas.width, canvas.height );
    
    // Título
    render.font = "24px Arial";
    render.fillStyle = "#FFFFFF";
    render.fillText( "Créditos", 30, 60 );

    // Botões
    render.font = "14px Arial"
    for ( let i = 0; i < credits.buttons.length; i++ )
    {
        render.fillText( credits.buttons[i].text, 30, 128 + 32*i );
        
        // Item selecionado
        if ( i == credits.selectedButton )
            render.fillRect( 10, 128 + 32*i - 8, 8, 8 );
    }

    render.font = "12px Arial";
    render.fillText( "Código fonte:", 30, 260 );
    render.fillStyle = "#00FF00";
    render.fillText( "github.com/Gaizgrol/WorkshopJogos", 30, 280 );
}

// Desenha o menu
function roomGame()
{
    // Controlador de disparos
    if ( game.player.canShoot )
    {
        setTimeout( () => {
            if ( room == "game" && game.player.integrity > 0 )
            {
                game.projectiles.push({
                    x: game.player.x,
                    y: game.player.y - 4,
                    width: 8,
                    height: 12
                });

                game.player.canShoot = true;
            }
        }, 500 );

        game.player.canShoot = false;
    }

    if ( game.canSpawnAsteroid )
    {
        setTimeout( () => {
            if ( room == "game" )
            {
                let size = Math.round( 1 + Math.random() * 3 ) * 8;

                game.asteroids.push({
                    size,
                    x: Math.round( Math.random() * 300 ),
                    y: 0,
                    vx: Math.round( -3 + Math.random() * 6 ),
                    vy: Math.round( 1 + Math.random() * 2 ),
                })

                game.canSpawnAsteroid = true;
            }
        }, 250 + Math.round( Math.random() * 500 ) );

        game.canSpawnAsteroid = false;
    }

    // Última posição
    let lastX = game.player.x;
    let lastY = game.player.y;

    // Atualização do jogador
    if ( keyPressed["ArrowUp"] == true )
        game.player.y -= 2;
    if ( keyPressed["ArrowDown"] == true )
        game.player.y += 2;
    if ( keyPressed["ArrowLeft"] == true )
        game.player.x -= 2;
    if ( keyPressed["ArrowRight"] == true )
        game.player.x += 2;

    // Teste de limites
    if ( game.player.x < 0 || game.player.x > 300 )
        game.player.x = lastX;
    if ( game.player.y < 0 || game.player.y > 300 )
        game.player.y = lastY;

    // Atualização dos projéteis (iteração reversa para evitar problemas na hora da remoção)
    for ( let i = game.projectiles.length - 1; i >= 0; i-- )
    {
        let projectile = game.projectiles[i];
        
        // Move o projétil
        projectile.y -= 4;

        // Teste de limites
        if ( projectile.x < 0 || projectile.x > 300 || projectile.y < 0 || projectile.y > 300 )
            // Remove da lista
            game.projectiles.splice( i, 1 );
    }

    // Atualização dos asteroides (iteração reversa para evitar problemas na hora da remoção)
    for ( let i = game.asteroids.length - 1; i >= 0; i-- )
    {
        let asteroid = game.asteroids[i];
        
        // Move o projétil
        asteroid.x += asteroid.vx;
        asteroid.y += asteroid.vy;

        // Teste de limites
        if ( asteroid.x < 0 || asteroid.x > 300 || asteroid.y < 0 || asteroid.y > 300 )
        {
            // Se remove da lista
            game.asteroids.splice( i, 1 );
        }

        // Teste de colisão com os projéteis
        for ( let p = 0; p < game.projectiles.length; p++ )
        {
            let projectile = game.projectiles[p];
            
            if ( boxIntersection( projectile.x - projectile.width/2,  projectile.y - projectile.height/2,  projectile.width,  projectile.height,
                                  asteroid.x - asteroid.size/2,       asteroid.y - asteroid.size/2,        asteroid.size,     asteroid.size ) )
            {
                // Remove o projétil da lista
                game.projectiles.splice( p, 1 );
                // Se remove da lista
                game.asteroids.splice( i, 1 );

                game.player.score++;
                console.log( game.player.score );
            }
        }

        // Colisão com o jogador
        if (boxIntersection( asteroid.x - asteroid.size/2, asteroid.y - asteroid.size/2, asteroid.size, asteroid.size,
                                game.player.x - 12, game.player.y - 8, 24, 16 )
            ||
            boxIntersection( asteroid.x - asteroid.size/2, asteroid.y - asteroid.size/2, asteroid.size, asteroid.size,
                                game.player.x - 6, game.player.y - 24, 12, 16 ))
        {
            // Se remove da lista
            game.asteroids.splice( i, 1 );

            // Diminui integridade da nave
            game.player.integrity -= asteroid.size;

            // Caso a nave tenha sido destruída
            if ( game.player.integrity <= 0 )
            {
                // Limpa o jogo
                game =
                {
                    player:
                    {
                        canShoot: true,
                        x: 150,
                        y: 250,
                        integrity: 100,
                        score: 0
                    },
                    projectiles: [],

                    canSpawnAsteroid: true,
                    asteroids: []
                };

                // Limpa teclas
                keyPressed = {};

                // Volta pro menu
                room = "menu";

                // Sai dessa execução
                return;
            }
        }
    }

    // Desenha plano de fundo
    render.fillStyle = "#000000";
    render.fillRect( 0, 0, canvas.width, canvas.height );
    
    // Desenha nave
    render.fillStyle = "#FFFFFF";
    render.fillRect( game.player.x - 12, game.player.y - 8, 24, 16 );
    render.fillRect( game.player.x - 6, game.player.y - 24, 12, 16 );

    // Desenha projeteis
    for ( let projectile of game.projectiles )
        render.fillRect( projectile.x - projectile.width/2, projectile.y - projectile.height/2, projectile.width, projectile.height );

    for ( let asteroid of game.asteroids )
        render.fillRect( asteroid.x - asteroid.size/2, asteroid.y - asteroid.size/2, asteroid.size, asteroid.size );

    // Desenha integridade da nave
    if ( game.player.integrity > 70 )
        render.fillStyle = "#00FF00";
    else if ( game.player.integrity > 50 )
        render.fillStyle = "#FFFF00";
    else if ( game.player.integrity > 30 )
        render.fillStyle = "#FF7F00";
    else
        render.fillStyle = "#FF0000";
    render.fillRect( 8, 284, Math.max( 0, game.player.integrity*300/100 ) - 16, 8 );

    // Desenha pontuação
    render.fillStyle = "#FFFFFF";
    render.fillText( game.player.score, 8, 32 );
}

// Função para detectar colisões entre retângulos
function boxIntersection( ax, ay, aw, ah, bx, by, bw, bh )
{
    return !(ax > bx+bw || ax+aw < bx || ay > by+bh || ay+ah < by);
}