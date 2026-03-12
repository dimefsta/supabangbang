extends CharacterBody2D

const SPEED = 300.0
const SCREEN_LEFT = 30
const SCREEN_RIGHT = 970

var safe := false
var safe_timer := 0.0

func _physics_process(delta):
	if safe:
		safe_timer -= delta
		modulate.a = 0.5
		if safe_timer <= 0:
			safe = false
			modulate.a = 1.0

	if Input.is_action_pressed("ui_right"):
		velocity.x = SPEED
	elif Input.is_action_pressed("ui_left"):
		velocity.x = -SPEED
	else:
		velocity.x = 0

	move_and_collide(velocity * delta)
	position.x = clamp(position.x, SCREEN_LEFT, SCREEN_RIGHT)

func activate_safe(duration: float):
	safe = true
	safe_timer = duration
	modulate.a = 0.5

func reset_position():
	position = Vector2(470, 650)
