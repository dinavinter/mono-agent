docker build -t e2e -f Dockerfile .
docker run -it --rm --ipc=host --user pwuser --security-opt seccomp=seccomp_profile.json -p 9090:8080 e2e  /bin/bash

## for trusted websites

docker run -it --rm --ipc=host -p 9090:8080 e2e  /bin/bash

## for trusted websites
#docker run -it --rm --ipc=host mcr.microsoft.com/playwright:v1.40.0-jammy /bin/bash