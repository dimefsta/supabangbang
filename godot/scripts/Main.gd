extends Node2D

var score := 0
var lives := 3
var harpoon_active := false
var game_over := false

@onready var player = $Player
@onready var balls_node = $Balls
@onready var harpoons_node = $Harpoons
@onready var score_label = $UI/ScoreLabel
@onready var lives_label = $UI/LivesLabel
@onready var game_over_label = $UI/GameOverLabel

func _ready():
	_spawn_initial_ball()

func _process(_delta):
	score_label.text = "Score: %d" % score
	lives_label.text = "Lives: %d" % lives

	if game_over:
		if Input.is_action_just_pressed("ui_accept"):
			_restart()
		return

	# Shoot harpoon with Space
	if Input.is_action_just_pressed("ui_accept") and not harpoon_active:
		_shoot_harpoon()

	# Check player-ball collisions
	if not player.safe:
		_check_player_ball_collision()

func _shoot_harpoon():
	harpoon_active = true
	var harpoon = load("res://scenes/Harpoon.tscn").instantiate()
	harpoon.position = player.position
	harpoons_node.add_child(harpoon)

func _check_player_ball_collision():
	for ball in balls_node.get_children():
		var dist = player.position.distance_to(ball.position)
		if dist < ball.radius + 12:
			_lose_life()
			break

func _lose_life():
	lives -= 1
	if lives <= 0:
		_trigger_game_over()
	else:
		player.reset_position()
		player.activate_safe(1.5)

func _trigger_game_over():
	game_over = true
	game_over_label.text = "GAME OVER\nScore: %d\nPress Space to Restart" % score
	game_over_label.visible = true

func _restart():
	game_over = false
	score = 0
	lives = 3
	harpoon_active = false
	game_over_label.visible = false
	player.reset_position()
	player.safe = false
	player.modulate.a = 1.0
	# Clear all balls and harpoons
	for child in balls_node.get_children():
		child.queue_free()
	for child in harpoons_node.get_children():
		child.queue_free()
	await get_tree().process_frame
	_spawn_initial_ball()

func _spawn_initial_ball():
	var ball = load("res://scenes/Ball.tscn").instantiate()
	ball.position = Vector2(500, 100)
	ball.radius = 30.0
	ball.ball_velocity = Vector2(150, 50)
	balls_node.add_child(ball)

func add_score(points: int):
	score += points

	# Check win condition
	if balls_node.get_child_count() == 0:
		await get_tree().create_timer(0.3).timeout
		_next_level()

func _next_level():
	# Spawn two balls for next level (harder)
	for i in 2:
		var ball = load("res://scenes/Ball.tscn").instantiate()
		ball.position = Vector2(250 + i * 500, 100)
		ball.radius = 30.0
		ball.ball_velocity = Vector2((1 if i == 0 else -1) * 180, 50)
		balls_node.add_child(ball)
