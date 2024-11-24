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

  iscollide(rect2) {
    return this.right > rect2.left && this.right < rect2.right && (
      this.top > rect2.top && this.top < rect2.bottom ||
      this.bottom < rect2.bottom && this.bottom > rect2.top
    ) || this.left < rect2.right && this.left > rect2.left && (
      this.top > rect2.top && this.top < rect2.bottom ||
      this.bottom < rect2.bottom && this.bottom > rect2.top
    ) || this.bottom > rect2.top && this.bottom < rect2.bottom && (
      this.left > rect2.left && this.left < rect2.right ||
      this.right < rect2.right && this.right > rect2.left
    ) || this.top < rect2.bottom && this.top > rect2.top && (
      this.left > rect2.left && this.left < rect2.right ||
      this.right < rect2.right && this.right > rect2.left
    )
  }
}


class Object extends Rect {
  step = 50;
  speed = 1;

  constructor(x, y, color) {
    super(x, y, 50, 50);
    this.color = color;
    this.velocityX = 0;
    this.velocityY = 0;

    this.isMoving = false;
    this.isPopping = false;
    this.canBeRemoved = false;
  }

  iscollide(rect2) {
    if (this.isPopping) { return false; }
    return super.iscollide(rect2);
  }

  draw(ctx) {
    ctx.strokeStyle = this.color;

    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.stroke();
  }

  animateMove() {
    if (!this.isMoving || this.isPopping) { return; }

    if (this.velocityX > 0) {
      this.velocityX -= this.speed;
    } else if (this.velocityX < 0) {
      this.velocityX += this.speed;
    }
    if (this.velocityY > 0) {
      this.velocityY -= this.speed;
    } else if (this.velocityY < 0) {
      this.velocityY += this.speed;
    }
    if (this.velocityX == 0 && this.velocityY == 0) {
      this.isMoving = false;
    }
  }

  animatePop() {
    if (!this.isPopping) { return; }

    this.width += this.velocityX;
    this.height += this.velocityY;
    this.x -= this.velocityX * 1.5;
    this.y -= this.velocityY * 1.5;

    if (this.velocityX > 0) {
      this.velocityX -= this.speed * 0.75;
    }
    if (this.velocityY > 0) {
      this.velocityY -= this.speed * 0.75;
    }
    if (this.velocityX <= 0 && this.velocityY <= 0) {
      this.canBeRemoved = true;
      this.isPopping = false;
      this.color = "#eee";
    }
  }

  update() {
    this.x += this.velocityX;
    this.y += this.velocityY;

    this.animateMove();
    this.animatePop();
  }

  pop() {
    this.isPopping = true;
    this.velocityX = Math.sqrt(this.width * 2);
    this.velocityY = Math.sqrt(this.height * 2);
  }

  move(direction) {
    if (this.isPopping) { return; }
    this.isMoving = true;

    switch (direction) {
      case 'r':
        this.velocityX = Math.sqrt(this.step * 2);
        break;

      case 'l':
        this.velocityX = -Math.sqrt(this.step * 2);
        break;

      case 'u':
        this.velocityY = -Math.sqrt(this.step * 2);
        break;

      case 'd':
        this.velocityY = Math.sqrt(this.step * 2);
        break;
    
      default:
        break;
    }
  }
}
