class Rect {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  get right() { return this.x + this.width; }
  get left() { return this.x; }
  get top() { return this.y; }
  get bottom() { return this.y + this.height; }
  get centerx() { return this.x + this.width / 2; }
  get centery() { return this.y + this.height / 2; }

  iscollide(rect2) {
    return this.right >= rect2.left && this.right <= rect2.right && (
      this.top >= rect2.top && this.top <= rect2.bottom ||
      this.bottom <= rect2.bottom && this.bottom >= rect2.top
    ) || this.left <= rect2.right && this.left >= rect2.left && (
      this.top >= rect2.top && this.top <= rect2.bottom ||
      this.bottom <= rect2.bottom && this.bottom >= rect2.top
    ) || this.bottom >= rect2.top && this.bottom <= rect2.bottom && (
      this.left >= rect2.left && this.left <= rect2.right ||
      this.right <= rect2.right && this.right >= rect2.left
    ) || this.top <= rect2.bottom && this.top >= rect2.top && (
      this.left >= rect2.left && this.left <= rect2.right ||
      this.right <= rect2.right && this.right >= rect2.left
    )
  }

  distanceto(rect2) {
    return Math.sqrt(Math.pow(this.centerx - rect2.centerx, 2) + Math.pow(this.centery - rect2.centery, 2))
  }
}


class Object extends Rect {
  static step = 50;
  static speed = 1;
  static obstacleSlowerColor = "#c0f6f8";
  static playerColor = "black";
  static enemyColor = "green";
  static ticksToLive = 500;

  constructor(x, y, color, width, height, geometry) {
    super(x, y, width ?? Object.step, height ?? Object.step);
    this.color = color;
    this.velocityX = 0;
    this.velocityY = 0;
    this.ticksAlive = 0;
    this.geometry = geometry ?? "rect";
    if (geometry === "circle") {
      this.radius = Math.sqrt(this.width * this.width + this.height * this.height) / 3;
    }
    this.slowness = 1; // step = step / slowness

    this.isMoving = false;
    this.isPopping = false;
    this.canBeRemoved = false;
  }

  get issolid() {
    return this.geometry === "rect" && this.color !== "green";
  }

  iscollide(rect2) {
    if (this.isPopping) { return false; }
    return super.iscollide(rect2);
  }

  draw(ctx) {
    ctx.strokeStyle = this.color;
    ctx.fillStyle = this.color;

    ctx.beginPath();
    if (this.geometry == "rect") {
      ctx.rect(this.x, this.y, this.width, this.height);
      ctx.stroke();
    } else if (this.geometry == "circle") {
      ctx.arc(this.centerx, this.centery, this.radius, 0, 2 * Math.PI, false);
      ctx.stroke();
    } else if (this.geometry == "fillrect") {
      ctx.rect(this.x, this.y, this.width, this.height);
      ctx.fill();
    }
  }

  animateMove(delta) {
    if (!this.isMoving || this.isPopping) { return; }

    if (this.velocityX > 0) {
      this.velocityX -= Object.speed * delta;
    } else if (this.velocityX < 0) {
      this.velocityX += Object.speed * delta;
    }
    if (this.velocityY > 0) {
      this.velocityY -= Object.speed * delta;
    } else if (this.velocityY < 0) {
      this.velocityY += Object.speed * delta;
    }
    if (Math.abs(this.velocityX) <= Object.speed * delta && Math.abs(this.velocityY) <= Object.speed * delta) {
      this.isMoving = false;
      this.velocityX = 0;
      this.velocityY = 0;
    }
  }

  animatePop(delta) {
    if (!this.isPopping) { return; }

    this.width += this.velocityX;
    this.height += this.velocityY;
    this.x -= this.velocityX * 1.5;
    this.y -= this.velocityY * 1.5;

    if (this.velocityX > 0) {
      this.velocityX -= Object.speed * 0.75;
    }
    if (this.velocityY > 0) {
      this.velocityY -= Object.speed * 0.75;
    }
    if (this.geometry === "circle") {
      this.radius = Math.sqrt(this.width * this.width + this.height * this.height) / 3 
    }
    if (this.velocityX <= 0 && this.velocityY <= 0) {
      this.canBeRemoved = true;
      this.isPopping = false;
      this.color = "#eee";
    }
  }

  update(delta) {
    this.ticksAlive++;
    this.x += this.velocityX;
    this.y += this.velocityY;

    if (this.left > window.canvas.widht || this.right < 0 || this.bottom < 0 || this.top > window.canvas.height) {
      this.canBeRemoved = true;
      return;
    }

    this.animateMove(delta);
    this.animatePop(delta);

    if (this.color === "red" && this.ticksAlive > Object.ticksToLive) {
      this.canBeRemoved = true;
    }
  }

  pop() {
    this.isPopping = true;
    this.velocityX = Math.sqrt(this.width * 2);
    this.velocityY = Math.sqrt(this.height * 2);
  }

  move(direction, step) {
    if (this.isPopping) { return; }
    this.isMoving = true;
    step = step ?? Object.step;

    switch (direction) {
      case 'r':
        this.velocityX = Math.sqrt(step / this.slowness * 2);
        break;

      case 'l':
        this.velocityX = -Math.sqrt(step / this.slowness * 2);
        break;

      case 'u':
        this.velocityY = -Math.sqrt(step / this.slowness * 2);
        break;

      case 'd':
        this.velocityY = Math.sqrt(step / this.slowness * 2);
        break;
    
      default:
        break;
    }
  }

  setSlowness(value) {
    this.slowness = value;
  }
}
