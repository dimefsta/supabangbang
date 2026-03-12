extends Node2D

const SPEED = 600.0
var start_y := 0.0
var tip_y := 0.0
var width := 4.0

func _ready():
	start_y = position.y
	tip_y = position.y

func _process(delta):
	tip_y -= SPEED * delta
	queue_redraw()

	# Harpoon reached ceiling - missed everything, reset
	if tip_y < 0:
		_release_and_destroy()
		return

	# Check collision with balls
	var balls_node = get_tree().get_root().get_node_or_null("Main/Balls")
	if balls_node == null:
		return
	for ball in balls_node.get_children():
		var tip_world = Vector2(position.x, tip_y)
		if tip_world.distance_to(ball.position) < ball.radius:
			ball.split()
			_release_and_destroy()
			return

func _draw():
	var local_start = Vector2(0, start_y - position.y)
	var local_tip = Vector2(0, tip_y - position.y)
	draw_line(local_start, local_tip, Color(1, 1, 1, 1), width)

func _release_and_destroy():
	var main = get_tree().get_root().get_node_or_null("Main")
	if main:
		main.harpoon_active = false
	queue_free()
