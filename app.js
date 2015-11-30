'use strict';

var dumpLinkApp = angular.module("dumpLinkApp",['ngRoute','ngAnimate','ui.bootstrap']);

dumpLinkApp.service("LinkDumpREST", function($http){
    //this.apiBase = "http://localhost:3000/api/";
    this.apiBase = "http://linkdump-kuukie.rhcloud.com/api/";

    this.getTitle = function(link,linkObj){
        console.log("Getting "+link);
        $http.get(this.apiBase+"geturltitle/"+encodeURIComponent(link))
            .success(function (data, status, headers, config) {
                console.log("success");
                console.log(status);
                console.log(data);
                linkObj.title = data.title;

            })
            .error(function (data, status, headers, config) {
                console.log("error");
                console.log(status);
                console.log(data);

            });
    };

    this.getTitlePOST = function(link,linkObj){
        console.log("posting title");
        $http.post(this.apiBase+'geturltitle',{link:link})
            .success(function (data, status, headers, config) {
                console.log("success");
                console.log(status);
                console.log(data);
                linkObj.title = data.title;

            })
            .error(function (data, status, headers, config) {
                console.log("error");
                console.log(status);
                console.log(data);

            });
    };

    this.postLinkDump = function(bears,cb){
        console.log("posting bears");
        $http.post(this.apiBase+'linkdump',{links:bears})
            .success(function (data, status, headers, config) {
                console.log("success");
                console.log(status);
                console.log(data);
                cb(data.id);
            })
            .error(function (data, status, headers, config) {
                console.log("error");
                console.log(status);
                console.log(data);

            });
    };

    this.getAllLinkDumps = function(){
        console.log("getting all dumps");
        $http.get(this.apiBase+'linkdump')
            .success(function (data, status, headers, config) {
                console.log("success");
                console.log(status);
                console.log(data);

            })
            .error(function (data, status, headers, config) {
                console.log("error");
                console.log(status);
                console.log(data);

            });
    };

    this.getLinkDump = function(id,cb,err){
        console.log("getting a dump");
        $http.get(this.apiBase+'linkdump/'+id)
            .success(function (data, status, headers, config) {
                console.log("success");
                console.log(status);
                console.log(data);

                cb(data);

            })
            .error(function (data, status, headers, config) {
                console.log("error");
                console.log(status);
                console.log(data);

                err();
            });
    }
});

dumpLinkApp.service("LinkList", function(){
    var linkList = this;

    linkList.links = [];
});

dumpLinkApp.controller("ShareDialogController",function($scope,$modalInstance,dumpId,dumpUrl){
    $scope.dumpId = dumpId;
    $scope.dumpUrl = dumpUrl;

    $scope.closeDialog = function () {
        $modalInstance.close();
    };
});

dumpLinkApp.controller("EditController",function($scope,LinkDumpREST,$modal,LinkList){
    console.log("In Edit");
    $scope.links = LinkList.links || [];
    $scope.newLink="";
    $scope.dumpName="";
    $scope.nameTemp ="";
    $scope.previousName ="";

    $scope.handleLineBreak = function(event){
        if(event.keyIdentifier ===("Enter" || "enter")){
            return false;
        }
    };
    $scope.updateName = function(){
        $scope.dumpName = $scope.nameTemp;
    };
    $scope.editName = function(){
        $scope.previousName = $scope.dumpName;
        $scope.dumpName="";

    };

    $scope.clear = function(){
        $scope.links =  LinkList.links =[];

    }
    $scope.print = function(){
        console.log(JSON.stringify($scope.links));
    };

    $scope.removeLink = function(link){
        $scope.links.splice(link, 1);
    };

    $scope.addNewLink= function(){
        if($scope.newLink.length > 0){
            $scope.links.push(createLink($scope.newLink));
            $scope.newLink ="";
        }

    };
    $scope.share= function(){
        console.log(JSON.stringify($scope.links));
        LinkDumpREST.postLinkDump($scope.links,function(id){
            shareDialog(id);
        });

    };
    $scope.copy= function(){

    };

    $scope.showDelete = function(link){
        link.showDelete = !link.showDelete;
    };

    $scope.getUrlTitle = function(){
        LinkDumpREST.getTitlePOST("http://www.gog.com");
    };


    function shareDialog (id) {
        var modalInstance = $modal.open({
            templateUrl: 'partials/share_dialog.html',
            controller: 'ShareDialogController',
            resolve: {
                dumpId: function () {
                    return id;
                },
                dumpUrl: function(){
                    console.log(location)
                    return window.location.href+id;
                }
            }
        });

    }

    function createLink(url){


        var link = {};
        link.url =url;
        link.showDelete = false;
        LinkDumpREST.getTitlePOST(url,link);
        //LinkDumpREST.getTitleFrontend(url,link);
        return link;
    }

    function getLastIndex(){
        if($scope.links.length >0){
            return $scope.links[$scope.links.length-1].position;
        }else{
            return 0;
        }

    }
});

dumpLinkApp.controller("ViewController",function($modal,$scope,$routeParams,$location,LinkDumpREST,LinkList){
    console.log($routeParams.dumpId);
    $scope.links = [];
    $scope.dumpId = $routeParams.dumpId;

    getDump($routeParams.dumpId);

    function getDump(dumpid){
        LinkDumpREST.getLinkDump(dumpid,
            function(data){
                $scope.foundDump = true;
                $scope.links = data.links;
                LinkList.links =data.links;
            },
            function(err){
                $scope.foundDump = false;
            }
        );
    }

    $scope.share= function(){
        reshareDialog($scope.dumpId);
    };

    $scope.edit = function(){
        $location.path('/');
    };

    function reshareDialog (id) {
        var modalInstance = $modal.open({
            templateUrl: 'partials/reshare_dialog.html',
            controller: 'ShareDialogController',
            resolve: {
                dumpId: function () {
                    return id;
                },
                dumpUrl: function(){
                    console.log(location)
                    return window.location.origin+window.location.pathname+"#/"+id;
                }
            }
        });

    }
});

dumpLinkApp.controller("HeaderController",function($scope,$location,$route,LinkList){
    $scope.homeUrl = window.location.origin+window.location.pathname+"#/";

    $scope.home = function(){
        console.log("Going home");
        LinkList.links = [];
        $location.path('/');
        $route.reload();
    }
});
/*
dumpLinkApp.config(['$routeProvider','$locationProvider',
    function($routeProvider,$locationProvider) {
        $routeProvider.
            when('/', {
                templateUrl: 'partials/edit_dump.html',
                controller: 'EditController'
            }).
            when('/:dumpId', {
                templateUrl: 'partials/view_dump.html',
                controller: 'ViewController'
            }).
            otherwise({
                redirectTo: '/'
            });

        $locationProvider.html5Mode(true);

    }
]);
*/
dumpLinkApp.config(function($routeProvider,$locationProvider) {
        $routeProvider.
            when('/', {
                templateUrl: 'partials/edit_dump.html',
                controller: 'EditController'
            }).
            when('/:dumpId', {
                templateUrl: 'partials/view_dump.html',
                controller: 'ViewController'
            }).
            otherwise({
                redirectTo: '/'
            });
        //$locationProvider.html5Mode(true);

    });


