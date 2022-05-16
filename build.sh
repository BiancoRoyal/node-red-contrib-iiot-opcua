gulp publish

if command -v podman &> /dev/null ; then
  PODS=podman
elif command -v docker $> /dev/null ; then
  PODS=docker
else
  echo "No container manager found, tried podman and docker"
  exit 1
fi

$PODS build --tag $1 .
