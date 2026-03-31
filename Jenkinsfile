pipeline {
    agent any

    environment {
        DOCKERHUB_IMAGE = 'ibtihelbaccari/streetleague-front'
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'master',
                    url: 'https://github.com/fehmikatar/StreetLeague_Front.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build --prod'
            }
        }

        stage('Docker Build') {
            steps {
                sh "docker build -t ${DOCKERHUB_IMAGE}:latest ."
            }
        }

        stage('Docker Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push ibtihelbaccari/streetleague-front:latest
                    '''
                }
            }
        }

        stage('Docker Run') {
            steps {
                sh 'docker stop streetleague-front || true'
                sh 'docker rm streetleague-front || true'
                sh '''
                    docker run -d \
                    --name streetleague-front \
                    -p 4200:80 \
                    ibtihelbaccari/streetleague-front:latest
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline Frontend terminé avec succès.'
        }
        failure {
            echo '❌ Pipeline Frontend échoué. Vérifiez les logs ci-dessus.'
        }
        always {
            cleanWs()
        }
    }
}
