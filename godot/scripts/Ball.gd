extends Node2D

# Ball drawn as a circle, bounces with gravity, splits when hit

const SCREEN_W = 1000
const SCREEN_H = 700
const GRAVITY = 180.0

var ball_velocity := Vector2(150, -150)
var radius := 30.0

func _process(delta):
	ball_velocity.y += GRAVITY * delta
	position += ball_velocity * delta

	# Wall bounce
	if position.x - radius < 0:
		position.x = radius
		ball_velocity.x = abs(ball_velocity.x)
	elif position.x + radius > SCREEN_W:
		position.x = SCREEN_W - radius
		ball_velocity.x = -abs(ball_velocity.x)

	# Ceiling bounce
	if position.y - radius < 0:
		position.y = radius
		ball_velocity.y = abs(ball_velocity.y)

	# Floor bounce
	if position.y + radius > SCREEN_H:
		position.y = SCREEN_H - radius
		ball_velocity.y = -abs(ball_velocity.y)

	queue_redraw()

func _draw():
	# Draw circle — no squares!
	draw_circle(Vector2.ZERO, radius, Color(0.2, 0.6, 1.0))

func split():
	var main = get_tree().get_root().get_node("Main")
	if radius > 12:
		var new_r = radius / 1.5
		for dir in [-1, 1]:
			var new_ball = load("res://scenes/Ball.tscn").instantiate()
			new_ball.position = position
			new_ball.radius = new_r
			new_ball.ball_velocity = Vector2(dir * abs(ball_velocity.x), -abs(ball_velocity.y))
			main.get_node("Balls").add_child(new_ball)
	var points = int(100.0 / radius * 10)
	main.add_score(points)
	queue_free()
