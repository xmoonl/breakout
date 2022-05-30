import React from "react";
import ReactDOM from "react-dom/client";
import * as Sounds from './sounds';
import './index.css';

document.addEventListener('keypress', (k) => {
    if(k.key === 'd' && !(Paddle.x >= window.document.body.clientWidth - brickWidth)) {
        Paddle.x += 15;
        console.log('Paddle.x += 15;\nPaddle.x: ' + Paddle.x.toString())
    }
    else if(k.key === 'a' && !(Paddle.x <= 1)) {
        Paddle.x -= 15;
        console.log('Paddle.x -= 15;\nPaddle.x: ' + Paddle.x.toString())
    }
})
function resetAll() {
    Ball.reset();
    Rect.reset();
    Paddle.reset();
}

window.onload = () => {
    console.log('Paddle.x: ' + window.document.body.clientWidth / 2)
    resetAll()
}

document.addEventListener('DOMContentLoaded', () => {
        setInterval(() => {
            try {
                update();
            } catch {
                document.getElementById('root').innerHTML = 
                    `<svg id="screen" width="100%" height="10000">
                        <text x="30" y="50" fill="white" font-size="30px">
                            Game Over!
                            Reload page to restart.
                            Score: ${points}
                        </text>
                    </svg>`
            }
        }, 10);
})
var lives = 3;
var points = 0;

class Paddle extends React.Component {
    static x = window.document.body.clientWidth / 2;
    render() {
        return (
            <>
                <rect
                    y={this.props.width * 8}
                    x={Paddle.x}
                    fill="lightgray"
                    width={this.props.width}
                    height={this.props.width / 4}
                    stroke="gray"
                />
                <line
                    y1={this.props.width * 8}
                    x1={Paddle.x + this.props.width / 4}
                    y2={this.props.width * 8 + (this.props.width / 4)}
                    x2={Paddle.x + this.props.width / 4}
                    stroke="gray" strokeWidth={2}
                />
                <line
                    y1={this.props.width * 8}
                    x1={(Paddle.x + this.props.width / 2)}
                    y2={this.props.width * 8 + (this.props.width / 4)}
                    x2={(Paddle.x + this.props.width / 2)}
                    stroke="gray"
                    strokeWidth={2}
                />
                <line
                    y1={this.props.width * 8}
                    x1={(Paddle.x + (this.props.width * 3) / 4)}
                    y2={this.props.width * 8 + (this.props.width / 4)}
                    x2={(Paddle.x + (this.props.width * 3) / 4)}
                    stroke="gray"
                    strokeWidth={2}
                />
            </>
        )
    }

    static reset() {
        Paddle.x = window.document.body.clientWidth / 2;
    }
}

class Ball extends React.Component {
    static x;
    static y;
    static dx;
    static dy;
    render() {
        Ball.x = Ball.x + Ball.dx;
        Ball.y = Ball.y + Ball.dy;
        return <circle cx={Ball.x} cy={Ball.y} r={this.props.r} fill="white" id="ball" />
    }

    static reset() {
        Ball.x = window.document.body.clientWidth / 2;
        Ball.y = 250;
        Ball.dx = Math.random() > 0.5 ? Math.random() * 1 : -(Math.random() * 1);
        Ball.dy = 1;
    }
}

class Rect extends React.Component {
    render() {
        return <rect x={this.props.x * this.props.width} y={this.props.y * (this.props.width / 3) + 70} width={this.props.width} height={this.props.width / 3} fill={this.props.color} stroke="black" className="brick" />
    }

    static reset() {
        var rects = document.getElementsByClassName('brick');
        for(var i=0; i<rects.length; i++) {
            rects[i].setAttribute('style', '');
        }
    }
}

var brickWidth;

class Screen extends React.Component {
    render() {
        const cols = 30;
        const screenWidth = window.document.body.clientWidth;
        brickWidth = screenWidth/cols;  
        const colors = ["#cf51c9", "red", "orange", "yellow", "green", "blue", "purple", "aqua"]
        
        return (
            <>
                <svg id="screen" width="100%" height={10000}>
                    <text x={3} y={20} fill="white">Lives: {lives}</text>
                    <text x={3} y={40} fill="white">{points} points</text>
                    <text x={3} y={60} fill="white">'a' and 'd' keys to move.</text>
                    <g id="blocks">
                        {[...Array(colors.length - 1).keys()].map(c => [...Array(cols).keys()].map(x => <Rect x={x} width={brickWidth} y={c} key={"c" + x + 'r' + c} color={colors[c]} />))}
                    </g>
                    <Ball r={screenWidth / 280} />
                    <g id="paddle"><Paddle width={brickWidth + 20} /></g>
                </svg>
            </>
        )
    }
}

var root = ReactDOM.createRoot(document.getElementById('root'));
update();

function update() {
    root.render(<React.StrictMode><Screen /></React.StrictMode>);
    var paddle = document.getElementById('paddle');
    var ball = document.getElementById('ball');
    var rects = document.getElementsByClassName('brick');
    for(var i=0; i<rects.length; i++) {
        if(colliding(rects[i].getBoundingClientRect(), ball.getBoundingClientRect()) && rects[i].getAttribute('style') !== 'display: none;') {
            console.log('thing');
            rects[i].setAttribute('style', 'display: none;');
            Ball.dy *= -1;
            Ball.y += Ball.dy;

            Ball.dx = Ball.dx + Math.random()*2 * Math.random() > 0.5 ? 1 : -1;
            points++;
            playSound(Sounds.breakBeep);
        }
    }
    try {
        if(ball.getBoundingClientRect().bottom > paddle.getBoundingClientRect().bottom + 30){
            lives--;
            Ball.reset();
            Paddle.reset();
            if(lives <= 0) {
                console.log('game over')
                root.unmount()

                playSound(Sounds.breakBeep)
                playSound(Sounds.gameOverBeep);
            }else {
                playSound(Sounds.breakBeep);
            }
        } else {
            if(colliding(paddle.getBoundingClientRect(), ball.getBoundingClientRect())) {
                playSound(Sounds.wallOrPaddleBeep);
                Ball.dy *= -1;
                Ball.y += Ball.dy;
            }
        
            if(Ball.x <= 0 || Ball.x >= document.body.clientWidth || Ball.y <= 0) {
                Ball.dx *= -1
                Ball.x += Ball.dx
                playSound(Sounds.wallOrPaddleBeep);
            }
        }
    } catch {
        
    }
}

function colliding(a, b) {
    if (
        b.left < a.left + a.width &&
        b.left + b.width > a.left &&
        b.top < a.top + a.height &&
        b.height + b.top > a.top
       ) {
        return true
    } else return false;
}

function playSound(url) {
    var sound = new Audio(url);
    sound.play();
}
