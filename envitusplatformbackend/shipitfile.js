module.exports = shipit => {
    require('shipit-deploy')(shipit)

    shipit.initConfig({
        default: {
            branch: process.env.GIT_BRANCH || 'master',
            workspace: '/tmp/github-monitor',
            deployTo: '/root/AHU',
            repositoryUrl: 'https://' + process.env.GIT_USERNAME + ':' + process.env.GIT_TOKEN + '@github.com/abdulalcodex/envitusplatformbackend.git',
            ignores: ['.git', 'node_modules'],
            keepReleases: 3,
            key: '~/.ssh/nikhil-alcdx2',
            shallowClone: true,
            frontendAppPath: process.env.FRONTEND_APP_PATH || '$HOME/work/alcodex/envitusplatformfrontend',
            backendAppPath: process.env.PWD,
            frontendAppRepositoryUrl: 'https://' + process.env.GIT_USERNAME + ':' + process.env.GIT_TOKEN + '@github.com/abdulalcodex/envitusplatformfrontend.git',
            frontendAppbranch: process.env.FRONTEND_APP_BRANCH || 'master',
        },
        dev: {
            servers: 'user@localhost',
            buildCmd: 'start:dev',
            forntendBuildCmd: 'build:dev',
            pm2AppNames: 'Envitus-Dev Envitus-AlarmService-Dev'
        },
        stage: {
            servers: 'user@localhost',
            buildCmd: 'start:stage',
            forntendBuildCmd: 'build:stage',
            pm2AppNames: 'Envitus-Stage Envitus-AlarmService-Stage'
        },
        prod: {
            servers: 'user@localhost',
            buildCmd: 'start:production',
            forntendBuildCmd: 'build:prod',
            pm2AppNames: 'Envitus-Prod Envitus-AlarmService-Prod'
        },

        dev_PBMS: {
            servers: 'user@localhost',
            buildCmd: 'start:dev_PBMS',
            forntendBuildCmd: 'build:PBMS',
            pm2AppNames: 'Envitus-PBMS-dev'
        },
        dev_Jhansi: {
            servers: 'user@localhost',
            buildCmd: 'start:dev_Jhansi',
            forntendBuildCmd: 'build:Jhansi',
            pm2AppNames: 'Envitus-Jhansi-dev Envitus-Jhansi-AlarmService'
        },
        dev_chennailnt: {
            servers: 'user@localhost',
            buildCmd: 'start:dev_chennailnt',
            forntendBuildCmd: 'build:chennailnt',
            pm2AppNames: 'Envitus-chennailnt-dev Envitus-chennailnt-AlarmService'
        },
        dev_Tvmsc: {
            servers: 'user@localhost',
            buildCmd: 'start:dev_Tvmsc',
            forntendBuildCmd: 'build:Tvmsc',
            pm2AppNames: 'Envitus-Tvmsc-dev Envitus-Tvmsc-AlarmService'
        },
        dev_DRDO: {
            servers: 'user@localhost',
            buildCmd: 'start:dev_DRDO',
            forntendBuildCmd: 'build:DRDO',
            pm2AppNames: 'Envitus-DRDO-dev Envitus-DRDO-AlarmService'
        },
        dev_deploy: {
            repositoryUrl: '',
            deployTo: process.env.DEPLOY_PATH || '/root/AHU',
            servers: process.env.DEPLOY_SERVER || 'root@159.89.163.128',
            forntendBuildCmd: process.env.FRONTENT_APP_BUILD_CMD || 'build:staging',
            buildCmd: process.env.BUILD_CMD || 'build:staging',
            pm2AppNames: process.env.PM2_APP_NAME || 'Envitus-dev Envitus-AlarmService',
            dockerBuildCmd: process.env.DOCKER_BUILD_CMD || 'build:staging_docker'
        },
        staging: {
            servers: 'root@159.89.163.128',
            deployTo: '/root/AHU',
            buildCmd: 'build:staging',
            forntendBuildCmd: 'build:staging',
            dockerBuildCmd: 'build:staging_docker',
            pm2AppNames: 'Envitus-staging Envitus-AlarmService'
        },
        staging_PBMS: {
            servers: 'root@159.89.163.128',
            deployTo: '/root/PBMS',
            buildCmd: 'build:staging_PBMS',
            forntendBuildCmd: 'build:PBMS_staging',
            dockerBuildCmd: 'build:staging_docker_PBMS',
            pm2AppNames: 'Envitus-PBMS-staging'
        },
        staging_Jhansi: {
            servers: 'root@159.89.163.128',
            deployTo: '/root/Jhansi',
            buildCmd: 'build:staging_Jhansi',
            forntendBuildCmd: 'build:Jhansi_staging',
            dockerBuildCmd: 'build:staging_docker_Jhansi',
            pm2AppNames: 'Envitus-Jhansi-staging Envitus-Jhansi-AlarmService'
        },
        staging_chennailnt: {
            servers: 'root@159.89.163.128',
            deployTo: '/root/chennailnt',
            buildCmd: 'build:staging_chennailnt',
            forntendBuildCmd: 'build:chennailnt',
            dockerBuildCmd: 'build:staging_docker_chennailnt',
            pm2AppNames: 'Envitus-chennailnt-staging Envitus-chennailnt-AlarmService'
        },
        staging_Tvmsc: {
            servers: 'root@159.89.163.128',
            deployTo: '/root/Tvmsc',
            buildCmd: 'build:staging_Tvmsc',
            forntendBuildCmd: 'build:Tvmsc_staging',
            dockerBuildCmd: 'build:staging_docker_Tvmsc',
            pm2AppNames: 'Envitus-Tvmsc-staging Envitus-Tvmsc-AlarmService'
        },
        staging_DRDO: {
            servers: 'root@159.89.163.128',
            deployTo: '/root/DRDO',
            buildCmd: 'build:staging_DRDO',
            forntendBuildCmd: 'build:DRDO_staging',
            dockerBuildCmd: 'build:staging_docker_DRDO',
            pm2AppNames: 'Envitus-DRDO-staging Envitus-DRDO-AlarmService'
        }
    });

    shipit.blTask('startES', async () => {
        return shipit.local([
            'cd ' + process.env.PWD,
            'cd ..',
            'cd envitusplatformfrontend',
            'rm -rf build',
            'npm install',
            'npm run ' + shipit.config.forntendBuildCmd,
            'cp -r build/  ' + shipit.config.backendAppPath + '/public/build',
            'cd ' + shipit.config.backendAppPath,
            'npm install',
            'pm2 stop ' + shipit.config.pm2AppNames + ' || true',
            'pm2 delete ' + shipit.config.pm2AppNames + ' || true',
            'npm run ' + shipit.config.buildCmd
        ].join('&&'));
    });


    shipit.blTask('devDocker', async () => {
        return shipit.local([
            'cd ' + shipit.config.frontendAppPath,
            '. ~/.nvm/nvm.sh',
            'nvm use 12',
            'npm run build:dev',
            'cp -r build/  ' + shipit.config.backendAppPath + '/public/',
            'cd ' + shipit.config.backendAppPath,
            'docker container stop $(docker container ls -a -q --filter name=envitus) || true',
            'docker rm $(docker container ls -a -q --filter name=envitus) || true',
            'docker rmi $(docker images "envitus" -q | uniq) || true',
            'docker build -t envitus . ',
            'docker run -d --name envitus --network host envitus'
        ].join('&&'));
    })

    shipit.blTask('startDocker', async () => {
        return shipit.local([
            'cd ' + shipit.config.frontendAppPath,
            // 'npm install',
            'npm run build:prod',
            'cp -r build/  ' + shipit.config.backendAppPath + '/public/',
            'cd ' + shipit.config.backendAppPath,
            'docker container stop $(docker container ls -a -q --filter name=envitus) || true',
            'docker rm $(docker container ls -a -q --filter name=envitus) || true',
            'docker rmi $(docker images "envitus" -q | uniq) || true',
            'docker build --platform linux/amd64 -t envitus . ',
            'docker run -d --name envitus --network host envitus'
        ].join('&&'));
    })

    shipit.blTask('buildDockerImg', () => {
        return shipit.local([
            'cd ' + shipit.workspace,
            'docker container stop $(docker container ls -a -q --filter name=envitus) || true',
            'docker rm $(docker container ls -a -q --filter name=envitus) || true',
            'docker image rmi $(docker images "envitus" -q | uniq) || true',
            'docker build -t envitus . --build-arg runCommand=' + shipit.config.dockerBuildCmd,
            'docker save envitus | gzip envitus.tar.gz'
        ].join('&&'))
    });

    shipit.blTask('remoteUpDocker', () => {
        return shipit.remote([
            'cd ' + shipit.config.deployTo + '/current',
            'docker container stop $(docker container ls -a -q --filter name=envitus) || true',
            'docker rm $(docker container ls -a -q --filter name=envitus) || true',
            'docker image rmi $(docker images "envitus" -q | uniq) || true',
            'docker load --input envitus.tar.gz',
            'docker run -d --name envitus --network host envitus'
        ].join('&&'))
    });

    shipit.blTask('deployDocker', () => {
        shipit.start("deploy:fetch", "buildDockerImgZip", "deploy:update", "deploy:publish", "remoteUpDocker", "deploy:clean");
    })
}
