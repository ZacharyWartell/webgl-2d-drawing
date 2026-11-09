# Version 1.3
ssh-add -l > /dev/null
if [[ $? -ne 0 ]]; then 
    echo "ssh-agent is not running, starting it..."
    eval $(ssh-agent -s)
fi 
hostname=$(uname -a | awk '{print $2}')
remote=$(git remote -v)

if [[ $remote =~ "github" ]]; then
    target="github"
fi
if [[ $remote =~ "gitlab" ]]; then
    target="gitlab"
fi

home=$(dirname ~/.ssh)
file="$home/.ssh/ids/$hostname-to-$target"
#echo "guess: $guess"
content=$(cat $file.pub 2> /dev/null)
ssh-add -L | grep -E "$content" > /dev/null
if [[ $? -eq 0 ]]; then
    echo "ssh key '$file' is already added to ssh-agent"
else 
    if [[ -f $file ]]; then    
        read -p "Use ssh key file name '$file'? [y/n]" yn
        if [[ $yn -eq "y" ]]; then
            ssh-add $file
        else
            read -p "ssh key file name: " KEY_FILE
            ssh-add ~/.ssh/ids/$KEY_FILE
        fi
    else
        read -p "ssh key file name: " KEY_FILE
        ssh-add ~/.ssh/ids/$KEY_FILE
    fi
fi