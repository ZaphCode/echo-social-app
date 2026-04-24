# start_pb:
# 	./__pb__/pocketbase serve

reset_node_modules:
	rm -rf node_modules bun.lockb package-lock.json yarn.lock .next
	bun install

dev:
	bun start

.DEFAULT_GOAL := dev