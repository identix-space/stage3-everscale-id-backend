pipeline {
    agent none
    environment {
       TELEGRAM_CHAT_ID = "-498313790"
       SHORTCOMMIT=""
       BRANCH="master"
   }
    options {
        buildDiscarder(logRotator(numToKeepStr: '30'))
        timeout(time: 1, unit: 'HOURS')
        timestamps()
        gitLabConnection('default')
    }
    triggers {
        gitlab(triggerOnPush: true, triggerOnMergeRequest: true, branchFilterType: 'All')
    }

    stages {
        stage('Build docker image'){
            agent { node 'master' }
                steps {
                    gitlabCommitStatus(name: "${STAGE_NAME}",builds: [[projectId: 'free-ton/backend', revisionHash: "${BRANCH}"],]){}
                    running("${STAGE_NAME}")
                    git([
                        url: "git@gitlab.com:free-ton/backend.git",
                        branch: env.BRANCH,
                    ])
                    script {
                        env.registry = "repo.mind-dev.com/mind-dev"
                        env.app_name = "free-ton/backend"
                        SHORTCOMMIT=sh(returnStdout: true, script: "git log -n 1 --pretty=format:'subject:%s, short hash: %h, author: is %an'").trim()
                    }
                    sh('''#!/bin/bash
                    echo "Building docker image"
                    docker build  -t \$registry/\${app_name}:\${BUILD_NUMBER} .
                    docker tag \$registry/\${app_name}:\${BUILD_NUMBER} \$registry/\${app_name}:master
                    docker push \$registry/\${app_name}:${BRANCH}
                    ''')
                }
             post {
                success {
                    success("${STAGE_NAME}")
                }
                failure {
                    failure("${STAGE_NAME}")
                }
              }
            }
            stage('Deploy') {
                agent { node 'develop' }
                    steps {
                        gitlabCommitStatus(name: "${STAGE_NAME}",builds: [[projectId: 'free-ton/backend', revisionHash: "${BRANCH}"],]){}
                        running("${STAGE_NAME}")
                        sh('''#!/bin/bash
                        cd /var/www/free-ton
                        docker-compose pull
                        docker-compose up -d
                        docker rmi $(docker images -a --filter=dangling=true -q) || exit 0
                        ''')
                    }
                post {
                   success {
                   success("${STAGE_NAME}")
                   }
                failure {
                   failure("${STAGE_NAME}")
                   }
                }
                    
            }
                
    }
    post { 
        success {
             node('master'){
                 withCredentials([string(credentialsId: 'TELEGRAM_BOT_ID', variable: 'TELEGRAM_BOT_ID'),
                                  string(credentialsId: 'TELEGRAM_BOT_TOKEN', variable: 'TELEGRAM_BOT_TOKEN')]) {
                    script {
                        String message = "Build #${currentBuild.number} ${SHORTCOMMIT} completed successful on free-ton-backend ${BRANCH}"
                        sendMessageToTelegramChanel(env.TELEGRAM_CHAT_ID, env.TELEGRAM_BOT_ID, env.TELEGRAM_BOT_TOKEN, message)
                    }
 
                }
             }    
        }
        failure {
            node('master'){
                withCredentials([string(credentialsId: 'TELEGRAM_BOT_ID', variable: 'TELEGRAM_BOT_ID'),
                                 string(credentialsId: 'TELEGRAM_BOT_TOKEN', variable: 'TELEGRAM_BOT_TOKEN')]) {
                    script {
                        String message = "Build #${currentBuild.number} ${SHORTCOMMIT} completed failure on free-ton-backend ${BRANCH}"
                        sendMessageToTelegramChanel(env.TELEGRAM_CHAT_ID, env.TELEGRAM_BOT_ID, env.TELEGRAM_BOT_TOKEN, message)
                 }
               } 
        }
      }
    }
}
def running(gitlabBuildName) {
    updateGitlabCommitStatus(name: "${gitlabBuildName}", state: 'running')
}

def success(gitlabBuildName) {
    updateGitlabCommitStatus(name: "${gitlabBuildName}", state: 'success')
}

def failure(gitlabBuildName) {
    updateGitlabCommitStatus(name: "${gitlabBuildName}", state: 'failed')
}
def sendMessageToTelegramChanel(chatId, botId, botToken, message) {
        message = java.net.URLEncoder.encode(message, "UTF-8")
        sh "curl -s --socks5-hostname 127.0.0.1:9050 -X POST https://api.telegram.org/bot${botId}:${botToken}/sendMessage -d chat_id=${chatId} -d text=${message}"
}
