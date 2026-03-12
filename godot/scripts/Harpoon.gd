extends Node2D

# Harpoon grows upward from player position, just like the JS version
# It's drawn as a thin white vertical line

const SPEED = 600.0
var start_y := 0.0
var tip_y := 0.0
var width := 4.0
var active := true

func _ready():
	start_y = position.y
	tip_y = position.y

func _process(delta):
	if not active:
		return
	tip_y -= SPEED * delta
	queue_redraw()
	if tip_y < 0:
		_destroy()

	# Check collision with balls manually
	var balls_node = get_tree().get_root().get_node("Main/Balls")
	for ball in balls_node.get_children():
		# Harpoon tip hits ball
		var tip = Vector2(position.x, tip_y)
		if tip.distance_to(ball.position) < ball.radius:
			ball.split()
			_destroy()
			return

func _draw():
	# Draw thin white vertical line from start_y up to tip_y (local coords)
	var local_start = Vector2(0, start_y - position.y)
	var local_tip = Vector2(0, tip_y - position.y)
	draw_line(local_start, local_tip, Color(1, 1, 1), width)

func _destroy():
	active = false
	var main = get_tree().get_root().get_node("Main")
	main.harpoon_active = false
	queue_free()
