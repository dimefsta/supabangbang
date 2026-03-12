extends Area2D

const SCREEN_W = 1000
const SCREEN_H = 700
const GRAVITY = 180.0

var ball_velocity := Vector2(150, -150)
var radius := 30.0

func _ready():
	_update_visual()

func _physics_process(delta):
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
	# Score based on ball size (smaller = more points)
	var points = int(100.0 / radius * 10)
	main.add_score(points)
	queue_free()

func _update_visual():
	var visual = get_node_or_null("Visual")
	if visual:
		visual.offset_left = -radius
		visual.offset_top = -radius
		visual.offset_right = radius
		visual.offset_bottom = radius
	# Update collision shape
	var col = get_node_or_null("CollisionShape2D")
	if col and col.shape:
		col.shape.radius = radius
