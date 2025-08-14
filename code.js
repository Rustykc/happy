document.addEventListener('DOMContentLoaded', function() {
            const c = document.getElementById('c');
            const ctx = c.getContext('2d');
            
            // Глобальный множитель скорости (увеличьте для замедления)
            const SPEED_MULTIPLIER = 1.5;
            
            // Настройки анимации
            const opts = {
                strings: [ 'ПОЗДРАВЛЯЮ', 'C ДНЁМ','РОЖДЕНИЯ!!'],
                charSize: 40,
                charSpacing: 50,
                lineHeight: 60,
                
                // Настройки фейерверков (временные параметры умножены на SPEED_MULTIPLIER)
                fireworkPrevPoints: 10,
                fireworkBaseLineWidth: 5,
                fireworkAddedLineWidth: 8,
                fireworkSpawnTime: 200 * SPEED_MULTIPLIER,
                fireworkBaseReachTime: 30 * SPEED_MULTIPLIER,
                fireworkAddedReachTime: 30 * SPEED_MULTIPLIER,
                fireworkCircleBaseSize: 25,
                fireworkCircleAddedSize: 15,
                fireworkCircleBaseTime: 30 * SPEED_MULTIPLIER,
                fireworkCircleAddedTime: 30 * SPEED_MULTIPLIER,
                fireworkCircleFadeBaseTime: 10 * SPEED_MULTIPLIER,
                fireworkCircleFadeAddedTime: 5 * SPEED_MULTIPLIER,
                fireworkBaseShards: 5,
                fireworkAddedShards: 5,
                fireworkShardPrevPoints: 3,
                fireworkShardBaseVel: 4,
                fireworkShardAddedVel: 2,
                fireworkShardBaseSize: 3,
                fireworkShardAddedSize: 3,
                
                // Настройки шариков
                gravity: 0.1,
                upFlow: -0.1,
                letterContemplatingWaitTime: 360 * SPEED_MULTIPLIER,
                balloonSpawnTime: 20 * SPEED_MULTIPLIER,
                balloonBaseInflateTime: 10 * SPEED_MULTIPLIER,
                balloonAddedInflateTime: 10 * SPEED_MULTIPLIER,
                balloonBaseSize: 25,
                balloonAddedSize: 25,
                balloonBaseVel: 0.4,
                balloonAddedVel: 0.4,
                balloonBaseRadian: -(Math.PI / 2 - 0.5),
                balloonAddedRadian: -1,
                
                // Настройки сердечек
                hearts: {
                    count: 20,
                    size: 15,
                    speed: 0.8, // уменьшено для более медленного движения
                    colors: ['#ff3366', '#ff6699', '#ff99cc', '#ff5050', '#ff0066'],
                    beatSpeed: 0.1 + Math.random() * 0.05
                }
            };

            // Инициализация
            let w = c.width = window.innerWidth;
            let h = c.height = window.innerHeight;
            let hw = w / 2;
            let hh = h / 2;
            const Tau = Math.PI * 2;
            const TauQuarter = Tau / 4;
            const letters = [];
            const hearts = [];
            
            ctx.font = opts.charSize + 'px Verdana';

            // Класс для букв
            class Letter {
                constructor(char, x, y) {
                    this.char = char;
                    this.x = x;
                    this.y = y;
                    this.dx = -ctx.measureText(char).width / 2;
                    this.dy = opts.charSize / 2;
                    this.fireworkDy = this.y - hh;
                    
                    const hue = x / (opts.charSpacing * Math.max(...opts.strings.map(s => s.length))) * 360;
                    this.color = `hsl(${hue}, 80%, 50%)`;
                    this.lightAlphaColor = `hsla(${hue}, 80%, light%, alp)`;
                    this.lightColor = `hsl(${hue}, 80%, light%)`;
                    this.alphaColor = `hsla(${hue}, 80%, 50%, alp)`;
                    
                    this.reset();
                }
                
                reset() {
                    this.phase = 'firework';
                    this.tick = 0;
                    this.spawned = false;
                    this.spawningTime = opts.fireworkSpawnTime * Math.random() |0;
                    this.reachTime = opts.fireworkBaseReachTime + opts.fireworkAddedReachTime * Math.random() |0;
                    this.lineWidth = opts.fireworkBaseLineWidth + opts.fireworkAddedLineWidth * Math.random();
                    this.prevPoints = [[0, hh, 0]];
                }
                
                step() {
                    if (this.phase === 'firework') {
                        this.fireworkPhase();
                    } else if (this.phase === 'contemplate') {
                        this.contemplatePhase();
                    } else if (this.phase === 'balloon') {
                        this.balloonPhase();
                    }
                }
                
                fireworkPhase() {
                    if (!this.spawned) {
                        ++this.tick;
                        if (this.tick >= this.spawningTime) {
                            this.tick = 0;
                            this.spawned = true;
                        }
                    } else {
                        ++this.tick;
                        
                        const linearProportion = this.tick / this.reachTime;
                        const armonicProportion = Math.sin(linearProportion * TauQuarter);
                        
                        const x = linearProportion * this.x;
                        const y = hh + armonicProportion * this.fireworkDy;
                        
                        if (this.prevPoints.length > opts.fireworkPrevPoints) {
                            this.prevPoints.shift();
                        }
                        
                        this.prevPoints.push([x, y, linearProportion * this.lineWidth]);
                        
                        const lineWidthProportion = 1 / (this.prevPoints.length - 1);
                        
                        for (let i = 1; i < this.prevPoints.length; ++i) {
                            const point = this.prevPoints[i];
                            const point2 = this.prevPoints[i - 1];
                            
                            ctx.strokeStyle = this.alphaColor.replace('alp', i / this.prevPoints.length);
                            ctx.lineWidth = point[2] * lineWidthProportion * i;
                            ctx.beginPath();
                            ctx.moveTo(point[0], point[1]);
                            ctx.lineTo(point2[0], point2[1]);
                            ctx.stroke();
                        }
                        
                        if (this.tick >= this.reachTime) {
                            this.phase = 'contemplate';
                            this.circleFinalSize = opts.fireworkCircleBaseSize + opts.fireworkCircleAddedSize * Math.random();
                            this.circleCompleteTime = opts.fireworkCircleBaseTime + opts.fireworkCircleAddedTime * Math.random() |0;
                            this.circleCreating = true;
                            this.circleFading = false;
                            this.circleFadeTime = opts.fireworkCircleFadeBaseTime + opts.fireworkCircleFadeAddedTime * Math.random() |0;
                            this.tick = 0;
                            this.tick2 = 0;
                            
                            this.shards = [];
                            const shardCount = opts.fireworkBaseShards + opts.fireworkAddedShards * Math.random() |0;
                            const angle = Tau / shardCount;
                            const cos = Math.cos(angle);
                            const sin = Math.sin(angle);
                            
                            let x = 1;
                            let y = 0;
                            
                            for (let i = 0; i < shardCount; ++i) {
                                const x1 = x;
                                x = x * cos - y * sin;
                                y = y * cos + x1 * sin;
                                
                                this.shards.push(new Shard(this.x, this.y, x, y, this.alphaColor));
                            }
                        }
                    }
                }
                
                contemplatePhase() {
                    ++this.tick;
                    
                    if (this.circleCreating) {
                        ++this.tick2;
                        const proportion = this.tick2 / this.circleCompleteTime;
                        const armonic = -Math.cos(proportion * Math.PI) / 2 + .5;
                        
                        ctx.fillStyle = this.lightAlphaColor.replace('light', 50 + 50 * proportion).replace('alp', proportion);
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, armonic * this.circleFinalSize, 0, Tau);
                        ctx.fill();
                        
                        if (this.tick2 > this.circleCompleteTime) {
                            this.tick2 = 0;
                            this.circleCreating = false;
                            this.circleFading = true;
                        }
                    } else if (this.circleFading) {
                        ctx.fillStyle = this.lightColor.replace('light', 70);
                        ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
                        
                        ++this.tick2;
                        const proportion = this.tick2 / this.circleFadeTime;
                        const armonic = -Math.cos(proportion * Math.PI) / 2 + .5;
                        
                        ctx.fillStyle = this.lightAlphaColor.replace('light', 100).replace('alp', 1 - armonic);
                        ctx.beginPath();
                        ctx.arc(this.x, this.y, this.circleFinalSize, 0, Tau);
                        ctx.fill();
                        
                        if (this.tick2 >= this.circleFadeTime) {
                            this.circleFading = false;
                        }
                    } else {
                        ctx.fillStyle = this.lightColor.replace('light', 70);
                        ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
                    }
                    
                    for (let i = 0; i < this.shards.length; ++i) {
                        this.shards[i].step();
                        
                        if (!this.shards[i].alive) {
                            this.shards.splice(i, 1);
                            --i;
                        }
                    }
                    
                    if (this.tick > opts.letterContemplatingWaitTime) {
                        this.phase = 'balloon';
                        this.tick = 0;
                        this.spawning = true;
                        this.spawnTime = opts.balloonSpawnTime * Math.random() |0;
                        this.inflating = false;
                        this.inflateTime = opts.balloonBaseInflateTime + opts.balloonAddedInflateTime * Math.random() |0;
                        this.size = opts.balloonBaseSize + opts.balloonAddedSize * Math.random() |0;
                        
                        const rad = opts.balloonBaseRadian + opts.balloonAddedRadian * Math.random();
                        const vel = opts.balloonBaseVel + opts.balloonAddedVel * Math.random();
                        
                        this.vx = Math.cos(rad) * vel;
                        this.vy = Math.sin(rad) * vel;
                    }
                }
                
                balloonPhase() {
                    ctx.strokeStyle = this.lightColor.replace('light', 80);
                    
                    if (this.spawning) {
                        ++this.tick;
                        ctx.fillStyle = this.lightColor.replace('light', 70);
                        ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
                        
                        if (this.tick >= this.spawnTime) {
                            this.tick = 0;
                            this.spawning = false;
                            this.inflating = true;
                        }
                    } else if (this.inflating) {
                        ++this.tick;
                        
                        const proportion = this.tick / this.inflateTime;
                        const x = this.cx = this.x;
                        const y = this.cy = this.y - this.size * proportion;
                        
                        ctx.fillStyle = this.alphaColor.replace('alp', proportion);
                        ctx.beginPath();
                        generateBalloonPath(x, y, this.size * proportion);
                        ctx.fill();
                        
                        ctx.beginPath();
                        ctx.moveTo(x, y);
                        ctx.lineTo(x, this.y);
                        ctx.stroke();
                        
                        ctx.fillStyle = this.lightColor.replace('light', 70);
                        ctx.fillText(this.char, this.x + this.dx, this.y + this.dy);
                        
                        if (this.tick >= this.inflateTime) {
                            this.tick = 0;
                            this.inflating = false;
                        }
                    } else {
                        this.cx += this.vx;
                        this.cy += this.vy += opts.upFlow;
                        
                        ctx.fillStyle = this.color;
                        ctx.beginPath();
                        generateBalloonPath(this.cx, this.cy, this.size);
                        ctx.fill();
                        
                        ctx.beginPath();
                        ctx.moveTo(this.cx, this.cy);
                        ctx.lineTo(this.cx, this.cy + this.size);
                        ctx.stroke();
                        
                        ctx.fillStyle = this.lightColor.replace('light', 70);
                        ctx.fillText(this.char, this.cx + this.dx, this.cy + this.dy + this.size);
                        
                        if (this.cy + this.size < -hh || this.cx < -hw || this.cy > hw) {
                            this.phase = 'done';
                        }
                    }
                }
            }

            // Класс для осколков фейерверка
            class Shard {
                constructor(x, y, vx, vy, color) {
                    const vel = opts.fireworkShardBaseVel + opts.fireworkShardAddedVel * Math.random();
                    this.vx = vx * vel;
                    this.vy = vy * vel;
                    this.x = x;
                    this.y = y;
                    this.prevPoints = [[x, y]];
                    this.color = color;
                    this.alive = true;
                    this.size = opts.fireworkShardBaseSize + opts.fireworkShardAddedSize * Math.random();
                }
                
                step() {
                    this.x += this.vx;
                    this.y += this.vy += opts.gravity;
                    
                    if (this.prevPoints.length > opts.fireworkShardPrevPoints) {
                        this.prevPoints.shift();
                    }
                    
                    this.prevPoints.push([this.x, this.y]);
                    
                    const lineWidthProportion = this.size / this.prevPoints.length;
                    
                    for (let k = 0; k < this.prevPoints.length - 1; ++k) {
                        const point = this.prevPoints[k];
                        const point2 = this.prevPoints[k + 1];
                        
                        ctx.strokeStyle = this.color.replace('alp', k / this.prevPoints.length);
                        ctx.lineWidth = k * lineWidthProportion;
                        ctx.beginPath();
                        ctx.moveTo(point[0], point[1]);
                        ctx.lineTo(point2[0], point2[1]);
                        ctx.stroke();
                    }
                    
                    if (this.prevPoints[0][1] > hh) {
                        this.alive = false;
                    }
                }
            }

            // Класс для сердечек
            class Heart {
                constructor() {
                    this.reset();
                }
                
                reset() {
                    this.x = Math.random() * w;
                    this.y = h + Math.random() * 100;
                    this.size = opts.hearts.size + Math.random() * 10;
                    this.speed = opts.hearts.speed * (0.5 + Math.random());
                    this.color = opts.hearts.colors[Math.floor(Math.random() * opts.hearts.colors.length)];
                    this.opacity = 0.1 + Math.random() * 0.9;
                    this.beatSpeed = 0.01 + Math.random() * 0.05;
                    this.beatSize = 1 + Math.random() * 0.3;
                    this.angle = Math.random() * Tau;
                    this.rotationSpeed = (Math.random() - 0.5) * 0.05;
                }
                
                update() {
                    this.y -= this.speed;
                    this.angle += this.rotationSpeed;
                    this.size = opts.hearts.size * (this.beatSize + Math.sin(Date.now() * this.beatSpeed) * 0.2);
                    
                    if (this.y < -50) {
                        this.reset();
                    }
                }
                
                draw() {
                    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.globalAlpha = this.opacity;
    
    // Математически точная форма сердца
    const s = this.size * 0.42;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    
    for (let t = 0; t < Math.PI * 2; t += 0.01) {
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
        
        if (t === 0) {
            ctx.moveTo(x * s/16, y * s/16);
        } else {
            ctx.lineTo(x * s/16, y * s/16);
        }
    }
    
    ctx.closePath();
    ctx.fill();
    ctx.restore();
                }
            }

            // Функция для генерации пути шарика
            function generateBalloonPath(x, y, size) {
                ctx.moveTo(x, y);
                ctx.bezierCurveTo(
                    x - size/2, y - size/2,
                    x - size/4, y - size,
                    x, y - size
                );
                ctx.bezierCurveTo(
                    x + size/4, y - size,
                    x + size/2, y - size/2,
                    x, y
                );
            }

            // Создаем буквы
            for (let i = 0; i < opts.strings.length; i++) {
                for (let j = 0; j < opts.strings[i].length; j++) {
                    letters.push(new Letter(
                        opts.strings[i][j],
                        j * opts.charSpacing + opts.charSpacing/2 - opts.strings[i].length * opts.charSpacing/2,
                        i * opts.lineHeight + opts.lineHeight/2 - opts.strings.length * opts.lineHeight/2
                    ));
                }
            }

            // Создаем сердечки
            for (let i = 0; i < opts.hearts.count; i++) {
                hearts.push(new Heart());
            }

            // Функция анимации
            function anim() {
                requestAnimationFrame(anim);
                
                // Очистка canvas
                ctx.fillStyle = '#111';
                ctx.fillRect(0, 0, w, h);
                
                // Рисуем сердечки
                hearts.forEach(heart => {
                    heart.update();
                    heart.draw();
                });
                
                // Рисуем буквы
                ctx.translate(hw, hh);
                let done = true;
                
                letters.forEach(letter => {
                    letter.step();
                    if (letter.phase !== 'done') done = false;
                });
                
                ctx.translate(-hw, -hh);
                
                if (done) {
                    letters.forEach(letter => letter.reset());
                }
            }

            // Обработчик изменения размера окна
            window.addEventListener('resize', () => {
                w = c.width = window.innerWidth;
                h = c.height = window.innerHeight;
                hw = w / 2;
                hh = h / 2;
                ctx.font = opts.charSize + 'px Verdana';
            });

            // Запуск анимации
            anim();
        });