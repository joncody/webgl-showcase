class Camera {
    constructor() {
        this.eye = new Vector3([0, 0.5, 5]);
        this.at = new Vector3([0, 0.5, -1]);
        this.up = new Vector3([0, 1, 0]);
        this.speed = 0.25;
    }

    moveForward() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        f.mul(this.speed);
        this.eye.add(f);
        this.at.add(f);
    }

    moveBackwards() {
        let f = new Vector3();
        f.set(this.eye);
        f.sub(this.at);
        f.normalize();
        f.mul(this.speed);
        this.eye.add(f);
        this.at.add(f);
    }

    moveLeft() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        let s = Vector3.cross(this.up, f);
        s.normalize();
        s.mul(this.speed);
        this.eye.add(s);
        this.at.add(s);
    }

    moveRight() {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        let s = Vector3.cross(f, this.up);
        s.normalize();
        s.mul(this.speed);
        this.eye.add(s);
        this.at.add(s);
    }

    moveUp() {
        this.eye.elements[1] += this.speed;
        this.at.elements[1] += this.speed;
    }

    moveDown() {
        this.eye.elements[1] -= this.speed;
        this.at.elements[1] -= this.speed;
    }

    panLeft(alpha = 5) {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        let f_prime = rotationMatrix.multiplyVector3(f);
        this.at.set(this.eye);
        this.at.add(f_prime);
    }

    panRight(alpha = 5) {
        this.panLeft(-alpha);
    }

    panUp(alpha = 5) {
        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        let s = Vector3.cross(f, this.up);
        s.normalize();
        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(alpha, s.elements[0], s.elements[1], s.elements[2]);
        let f_prime = rotationMatrix.multiplyVector3(f);
        this.at.set(this.eye);
        this.at.add(f_prime);
    }

    panDown(alpha = 5) {
        this.panUp(-alpha);
    }
}
