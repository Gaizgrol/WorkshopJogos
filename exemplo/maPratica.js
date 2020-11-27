/**@type HTMLCanvasElement*/
let canvas = null;

/**@type CanvasRenderingContext2D*/
let render = null;

let room = "menu";

let menu = {
    buttons: [
        { text: 'Jogar', room: 'game' },
        { text: 'Créditos', room: 'credits' },
    ],
    selectedButton: 0,
}

document.addEventListener("DOMContentLoaded", () => {
    canvas = document.getElementById("gameScreen");
    render = canvas.getContext("2d");
    main();
});

function main()
{
    switch ( room )
    {
        case "game":
            stepGame();
            renderGame();
            break;
        case "credits":
            stepCredits();
            renderCredits();
            break;
        default:
            stepMenu();
            renderMenu();
            break;
    }
    requestAnimationFrame( main );
}

function stepMenu()
{
    menu.selectedButton = (menu.selectedButton + 1) % 2;
}

function renderMenu()
{
    render.fillStyle = "#000000";
    render.font = ""
    render.fillRect( 0, 0, canvas.width, canvas.height );

    render.fillStyle = "#FFFFFF";
    render.fillText( "Salve", 60, 60 );
}