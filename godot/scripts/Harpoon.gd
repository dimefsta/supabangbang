extends Area2D

const SPEED = 600.0

func _physics_process(delta):
	position.y -= SPEED * delta
	if position.y < -20:
		queue_free()

func _ready():
	# Connect to ball overlap
	connect("area_entered", _on_area_entered)

func _on_area_entered(area):
	if area is Area2D and area.has_method("split"):
		area.split()
		var main = get_tree().get_root().get_node("Main")
		main.harpoon_active = false
		queue_free()
