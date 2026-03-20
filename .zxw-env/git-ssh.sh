eval $(ssh-agent -s)
read -p "ssh key file name: " KEY_FILE
ssh-add ~/.ssh/ids/$KEY_FILE
