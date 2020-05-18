'use strict';

/**
 * @ngdoc function
 * @name anyandgoApp.controller:NotebookCtrl
 * @description
 * # NotebookCtrl
 * Controller of the anyandgoApp
 */
angular.module('nodebookApp')
  .controller('NotebookCtrl', function ($log, $scope, $timeout, $http, $modal,
    $rootScope, $routeParams, $location, smoothScroll, Restangular, hotkeys, LocalStorageServ,
    NotebookStorageServ,   youtubeEmbedUtils) {
    // Notebook
    // Load Rows
    // Add Rows
    // Cut Rows
    // Paste Rows
    // Reorder Rows
    // Save Nootebook
    $scope.notebook = {
      title: 'Untitled',
      externalnotebook: {
        url: '',
      },
      video: {
        url: 'https://www.youtube.com/watch?v=pal4cDvTmzI',
        videoId: '',
        msg: '',
        actions: [
          // { time: { start: 5, end: 60}, row: 10 },
          // { time: { start: 60, end: 250}, row: 1 },
        ],
      },
      rows: []
    };
    $scope.notebook.config = {
      selected_row_pos: 0,
      selected_row_type: 'markdown'
    };
    $rootScope.jsNotebook = $scope.notebook;

    // Edit title
    $scope.editingTitle = false;
    $scope.editTitle = function(status) {
      $scope.editingTitle = status;
    }
    $scope.changeTitle = function(event) {
      console.log(event);
      if (event.keyCode == 13) {
        $scope.editTitle(false);
      }
    }

    // Edit externalnotebook
    $scope.editingExternalNotebook = false;
    $scope.gotoExternalNotebook = function(status) {
      $scope.editingExternalNotebook = status;
      $location.path('/?url='+$scope.notebook.externalnotebook.url);
    }
    $scope.editExternalNotebook = function(status) {
      $scope.editingExternalNotebook = status;
    }
    $scope.changeExternalNotebook = function(event) {
      console.log(event);
      if (event.keyCode == 13) {
        $scope.editExternalNotebook(false);
      }
    }
    $scope.$watch('notebook.externalnotebook.url', function(){
      console.log('ExternalNotebook url changed');
      var url = $scope.notebook.externalnotebook.url;
      var externalnotebookId = url.substring(0, 18)+'...';
      if (url.match(/http.*\/.*/)) {
        $scope.notebook.externalnotebook.externalnotebookId = externalnotebookId;
        $scope.notebook.externalnotebook.msg  = externalnotebookId;
      } else {
        $scope.notebook.externalnotebook.externalnotebookId = '';
        $scope.notebook.externalnotebook.msg = 'Invalid URL';
      }
    });

    // Edit video
    $scope.editingVideo = false;
    $scope.editVideo = function(status) {
      $scope.editingVideo = status;
    }
    $scope.changeVideo = function(event) {
      console.log(event);
      if (event.keyCode == 13) {
        $scope.editVideo(false);
      }
    }
    $scope.$watch('notebook.video.url', function(){
      console.log('Video url changed');
      var url = $scope.notebook.video.url;
      var videoId = youtubeEmbedUtils.getIdFromURL($scope.notebook.video.url);
      if (url.match(/http.*youtube.*/) && videoId !== '') {
        $scope.notebook.video.videoId = videoId;
        $scope.notebook.video.msg  = 'ID '+videoId;
        // $scope.bestPlayer.playVideo();
      } else {
        $scope.notebook.video.videoId = '';
        $scope.notebook.video.msg = 'Invalid Video';
      }
    });

    $scope.videoPlaying = false;
    $scope.videoCurrentTime = 0;
    $scope.videoPlayer = {};

    $scope.$on('youtube.player.ready', function ($event, player) {
      console.log('youtube.player.ready');
    });
    $scope.$on('youtube.player.ended', function ($event, player) {
      console.log('youtube.player.ended');
    });
    $scope.$on('youtube.player.playing', function ($event, player) {
      console.log('youtube.player.playing');
      $scope.videoPlayer = player;
      $scope.videoPlaying = true;
    });
    $scope.$on('youtube.player.paused', function ($event, player) {
      console.log('youtube.player.paused');
      $scope.videoPlaying = false;
    });
    $scope.$on('youtube.player.buffering', function ($event, player) {
      console.log('youtube.player.buffering');
    });
    $scope.$on('youtube.player.queued', function ($event, player) {
      console.log('youtube.player.queued');
    });
    $scope.$on('youtube.player.error', function ($event, player) {
      console.log('youtube.player.error');
      $scope.videoPlaying = false;
    });
    // check positoin
    var timer = null;
    var runIt = function(){
      if($scope.videoPlaying && $scope.videoPlayer && $scope.videoPlayer.getDuration) {
        var player = $scope.videoPlayer;
        var ct = player.getCurrentTime();
        console.log('youtube.current.time', ct);
        $scope.videoCurrentTime = parseInt(ct, 10);
        // $scope.notebook.video.ct = parseInt(ct, 10);
        var actions = $scope.notebook.video.actions || [];
        var action = actions.find(function(a){ return ct > a.time.start && ct < a.time.end; })
        if (action) {
          console.log('youtube.current.time.action', action);
          $scope.selected = action.row;
          $scope.activateSelection($scope.selected);
        }
      } else {
        if (!$scope.videoPlayer) {
          // $scope.notebook.video.ct = 0;
          $scope.videoCurrentTime = 0;
        }
        console.log('youtube.current.loop');
      }
      timer = $timeout(runIt, 2000);
    };
    runIt();

    $scope.$on("$destroy", function() {
      if (timer) {
        $timeout.cancel(timer);
      }
    });


    //Shortcut
    $scope.selected = $scope.notebook.config.selected_row_pos;

    $scope.createNew = function(newNotebook) {
      var rand = Math.round(Math.random()*10000000000000000);
      var emptyNotebook = {
        title: 'Untitled',
        uniqueId: 'nb_'+Date.now()+rand,
        video: {
          url: '',
          videoId: '',
          msg: '',
          actions: [
            // { time: { start: 5, end: 60}, row: 10 },
          ],
        },
        rows: []
      };
      $scope.notebook = newNotebook || emptyNotebook;
      $scope.notebook.config = {
        selected_row_pos: 0,
        selected_row_type: 'markdown'
      };
      $rootScope.jsNotebook = $scope.notebook;
      if($scope.videoPlaying && $scope.videoPlayer && $scope.videoPlayer.getDuration) {
        $scope.videoPlayer.stopVideo();
        $scope.videoPlayer.clearVideo();
        $scope.videoPlaying = false;
        $scope.videoCurrentTime = 0;
      }
      NotebookStorageServ.create($scope.notebook.uniqueId, $scope.notebook);
      // Scroll top
      $('html,body').animate({scrollTop: 0 }, 100);
      // Redirect to new URL just in case
      $location.path('/nb/'+$scope.notebook.uniqueId);
    }

    $scope.loadNotebook = function(template) {
			template = template || 'notebook-default.json';
      $http.get($rootScope.config.app_domain+'/json/'+template)
        .then(function(res) {
          if (typeof res.data !== 'undefined' && angular.isDefined(res.data.rows)) {
            LocalStorageServ.set('jsnotebook', res.data)
            // $scope.createNew(res.data);
            $scope.loadFromLS();
          }
        })
    };

    $scope.loadQuickStart = function(template) {
			template = template || 'notebook-default.json';
      $http.get($rootScope.config.app_domain+'/json/'+template)
        .then(function(res) {
          if (typeof res.data !== 'undefined' && angular.isDefined(res.data.rows)) {
            NotebookStorageServ.setContents(res.data.uniqueId, res.data);
            $location.path('/nb/'+res.data.uniqueId);
          }
        })
    };

    $scope.openHelp = function() {
      hotkeys.toggleCheatSheet();
    };

    $scope.addRow = function(rowInfo){
      $log.log("Adding Row");
      var empty_row = {
        row_type: (rowInfo) ? rowInfo.row_type : '',
        order: (rowInfo) ? rowInfo.order : 0,
        content: (rowInfo) ? rowInfo.content : '',
        loaded: false,
        editing: false,
        selected: false,
        ts: (rowInfo) ? rowInfo.ts : Date.now()
      };


      if (!rowInfo) {
      empty_row.row_type = $scope.notebook.config.selected_row_type;
      empty_row.order = $scope.notebook.rows.length;
      }

      // custom for editor
      if (empty_row.row_type === 'code' && empty_row.content === '') {
        empty_row.content = '// Write your nodeJS code here... and press shift+enter to execute'
      }

      var len = $scope.notebook.rows.length;

      if(len > 0){
        // Paste after
        // No al final sino debajo de la selected row
        $scope.notebook.rows.splice($scope.selected+1, 0,empty_row);
        $scope.selected++;
        $scope.activateSelection($scope.selected);
      } else {
        $scope.notebook.rows.push(empty_row);
        // Set new row as selected
        $scope.selected = 0;
        $scope.activateSelection($scope.selected);
      }
    };

    $scope.cutRow = function(row){
      $log.log("Cut Row");
      $scope.copyRow();
      $scope.removeRow();
    };

    $scope.removeRow = function(){
      $log.log("Remove Row");
      $scope.getSelectedRow(function(row){
        var i = $scope.notebook.rows.indexOf(row);
        if(i !== -1){
          $scope.activateClosestRow(i);
          //delete $scope.notebook.rows[i];
          $scope.notebook.rows.splice(i, 1);
          $scope.selected--;
        }

      });
    };

    $scope.selectRow = function(row){
      $log.log("Select by click");
      var index = $scope.notebook.rows.indexOf(row);
      if(index !== -1) {
        $log.log("Selecting: ", index, row);
        $scope.selected = index;
        $scope.activateSelection($scope.selected);
      }
    };

    $scope.copied_row = null;

    $scope.copyRow = function(){
      $log.log("Copy Row");
      $scope.getSelectedRow(function(row){
        $scope.copied_row = angular.copy(row);
        // Override
        $scope.copied_row.ts = Date.now();
        $scope.copied_row.order = null;
        $scope.copied_row.selected = false;
        $scope.copied_row.editing = false;
        $log.log("Copy success");
      });
    };

    $scope.pasteRow = function(row){
      $log.log("Paste Row");
      if($scope.copied_row != null){
        //var new_row = angular.copy($scope.copied_row);
        var new_row = {
          row_type: '', order: 0, content: '', loaded: false,
          editing: false, selected: false, ts: Date.now() };
        new_row.content = $scope.copied_row.content;
        new_row.row_type = $scope.copied_row.row_type;

        if($scope.notebook.rows.length > 0) {
        // Paste at position
        $scope.getSelectedRow(function(row){
          var i = $scope.notebook.rows.indexOf(row);
          // TODO: reorder rows
          if(i !== -1){
            // Paste after
            $scope.notebook.rows.splice(i+1, 0, new_row);
            // Set this new row as selected
            $scope.activateClosestRow(i);
          }

        });
        } else {
          //There's no other rows
          // new_row.selected = true;
          $scope.notebook.rows.push(new_row);
          $scope.selected = 0;
          $scope.activateSelection($scope.selected);
        }
      } else {
        $log.log("Nothing on the clipboard, sorry");
      }
    };

    $scope.moveRow = function(dir){
      $log.log("Move Row", dir);
      var dir_to = dir || null;
      var len = $scope.notebook.rows.length;

      if( len > 1 && typeof dir === "string" && dir.match(/up|down/)){
        $scope.getSelectedRow(function(row){
          var i = $scope.notebook.rows.indexOf(row);
          // TODO: reorder rows
          if(i !== -1){
            var next_pos = null;
            if(dir === 'up') {
              next_pos = i - 1;
            }
            if(dir === 'down') {
              next_pos = i + 1;
            }

            if(next_pos === -1 || next_pos >= len){
              $log.log("Out of range", next_pos);
              next_pos = null;
            }

            if(typeof next_pos === 'number'){
              var tmp = $scope.notebook.rows.splice(i,1);
              $scope.notebook.rows.splice(next_pos,0,tmp[0]);

              // Set this new row as selected
              $scope.selected = next_pos;
              $scope.activateSelection($scope.selected);
              $log.log("Moved "+dir);
            }
          }

        });
      }

    };
    $scope.printDoc = function(row){
      $log.log("Printing doc...", $scope.notebook);
      window.print();
    }
    // Download file
    // https://stackoverflow.com/a/18197341/467034
    $scope.downloadFile = function(filename, text) {
      var element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    };

    $scope.downloadDoc = function(row){
      $log.log("DowDownloadd doc...", $scope.notebook);
      $scope.downloadFile('notebook.json', JSON.stringify($scope.notebook));
    };

    $scope.saveDoc = function(row){
      $log.log("Save doc...", $scope.notebook);
      // $scope.downloadFile('notebook.json', JSON.stringify($scope.notebook));
      if (window.NOTEBOOK_ID && window.NOTEBOOK_ID !== '') {
        Restangular.one('api/v1/notes', window.NOTEBOOK_ID).get().then(function(note) {
          note.rows = $scope.notebook.rows;
          note.name = "Demoxx";
          note.put().then(function(n) {
            $log.log("Editing doc...", n);
          });
        });
      } else {
        // Creating it's new
        Restangular.all('api/v1/notes').post($scope.notebook).then(function(note) {
          $log.log("Creating doc...", note);
        });
      }
    };

    if (window.NOTEBOOK_ID && window.NOTEBOOK_ID !== '') {
      // global exists grab the notebook
      Restangular.one('api/v1/notes', window.NOTEBOOK_ID).get().then(function(note) {
        $log.log(note);
        // $scope.notebook.rows = note.rows;
        note.rows.forEach( function(r) {
          $scope.addRow(r);
        });
      });
    }

    $scope.turnEditing = function(row, state, event){
      var index = $scope.notebook.rows.indexOf(row);
      $log.log("Editing: ", state, row);
      if(index !== -1) {
        if(state){
          // Set other rows to editing false
          $scope.notebook.rows.forEach(function(row, i){
            $scope.notebook.rows[i].editing = false;
          })
        }
        // If edition is off, state false
        $scope.notebook.rows[index].editing = state;

        if(state && row.row_type.match(/(formula|markdown)/) ){
          // Set focus to editor
          $log.log("Set focus to editor");
          var ts = $scope.notebook.rows[index].ts;
          $timeout(function(){
            $('[data-ts="'+ts+'"] textarea:visible').focus();
          }, 100);
        }

        if(state && row.row_type.match(/code/) ){
					var editor = ace.edit('editor_'+row.ts);
					$log.info('Focusing editor:', 'editor_'+row.ts);
					$timeout(function(){
						if(!editor.isFocused()){
							editor.focus();
						}
					},1)
        }
      }
    };

    $scope.activateClosestRow = function(i){
      if(typeof $scope.notebook.rows[i+1] !== "undefined"){
        $log.log('There is a next row');
        $scope.selected = i+1;
        $scope.activateSelection($scope.selected);

      } else if(typeof $scope.notebook.rows[i-1] !== "undefined"){
        $log.log('There is a previous row');
        $scope.selected = i-1;
        $scope.activateSelection($scope.selected);

      } else {
        $log.log('There is no other row');

      }

    };

    $rootScope.offEdditing = function(){
      // Editing false for all
      if($scope.notebook.rows.length > 0) {
        $scope.notebook.rows.forEach(function(row, i){
          var r = $scope.notebook.rows[i].editing;
          $scope.notebook.rows[i].editing = false;
          $log.log("Editing false", r);
        });
        $log.log("Editing false for all");
      }
    };

    $scope.activateSelection = function(index){
      if($scope.notebook.rows.length > 0) {
      $scope.notebook.rows.forEach(function(row, i){
        $scope.notebook.rows[i].selected = false;
      });
      // If edition is off, state false
      $scope.notebook.rows[index].selected = true;
      }
    };
    $scope.activateSelection($scope.selected);

    $scope.getSelectedRow = function(cb){
      var row = null;
      $scope.notebook.rows.forEach(function(r, i){
        if(r.selected){
          row = r;
        }
      });
      if(typeof cb === 'function') {
        if(row) { cb(row); }
      } else {
        throw new Error('Missing callback: function was expected');
      }
    }

    // Check if selected is visible
    $scope.scrollIfNotVisible = function(){
      var row = null;
      $scope.notebook.rows.forEach(function(r, i){
        if(r.selected){
          row = r;
        }
      });
      if(row){
        var element = $('[data-ts="'+row.ts+'"]');
        if(element.size() > 0){
          var elem = element.find(".smartrow");
          var docViewTop = $(window).scrollTop();
          var docViewBottom = docViewTop + $(window).height();

          var elemTop = $(elem).offset().top;
          var elemBottom = elemTop + $(elem).height();
          var isScrolledIntoView = (elemBottom <= docViewBottom) && (elemTop >= docViewTop);

          if(!isScrolledIntoView) {
            $log.log("Scroll to element");
            smoothScroll(element[0], { duration: 1000, offset: 150});
          }
          /*
          var offset = element.offset().top - $(window).scrollTop();

          if(offset > (window.innerHeight-10) ){
            $log.log("Scrolling Down");
            // Not in view
            $('html,body').animate({scrollTop: offset-60}, 100);
          }
          if(element.find(".smartrow:visible").size() == 0
            && offset < $(window).scrollTop() ){
            var h = element.find(".smartrow").height();
            $log.log("Scrolling Up");
            // Not in view
            $('html,body').animate({scrollTop: h}, 100);
          }
          if( offset < 150){
            $log.log("Scrolling Top");
            // Not in view
            $('html,body').animate({scrollTop: 0 }, 100);
          }
          */
        }
      }
    }

    $scope.$watch('selected', function(){
      // Is selected row visible?
      $timeout(function(){
        $scope.scrollIfNotVisible();
      },10);
    });

    // Hotkeys
    // Useful key codes

    // https://github.com/chieffancypants/angular-hotkeys#binding-hotkeys-in-controllers

    // hotkeys.bindTo($scope).add
    hotkeys.add({
      combo: 'up',
      description: 'Changes selected row to the one above',
      callback: function(event, hotkey) {
        event.preventDefault();
        event.stopPropagation();
        $log.log('Up', $scope.selected, $scope.notebook.rows.length);
        if($scope.selected > 0){
          $scope.selected -= 1;
          $scope.activateSelection($scope.selected);
        }
      }
    });
    hotkeys.add({
      combo: 'down',
      description: 'Changes selected row to the one below',
      callback: function(event, hotkey) {
        event.preventDefault();
        event.stopPropagation();
        $log.log('Down', $scope.selected, $scope.notebook.rows.length);
        if($scope.selected < $scope.notebook.rows.length-1){
          $scope.selected += 1;
          $scope.activateSelection($scope.selected);
        }
      }
    });
    hotkeys.add({
      combo: 'enter',
      description: 'Turns on edition for selected row',
      callback: function(event, hotkey) {
        event.preventDefault();
        event.stopPropagation();
        //$log.log($scope.selected, $scope.notebook.rows.length);
        var row = $scope.notebook.rows[$scope.selected];
        //TODO: Or editor not focused
        if(!row.editing || 1){
          $scope.turnEditing(row, true);
        }
      }
    });
    hotkeys.add({
      combo: 'shift+enter',
      description: 'Executes or turns edition mode off for selected row',
      callback: function(event, hotkey) {
      }
    });
    // Add a new row
    hotkeys.add({
      combo: 'command+shift+a',
      description: 'Add new row',
      callback: function(event, hotkey) {
        console.log('Adding new row');
        event.preventDefault();
        $timeout(function() {
          $('[ng-click="addRow()"]').click();
          $timeout(function() {
            var row = $scope.notebook.rows[$scope.selected];
            if(!row.editing || 1){
              $scope.turnEditing(row, true);
            }
          }, 100);
        }, 10);
      }
    });
    // Copy selected row
    hotkeys.add({
      combo: 'command+shift+c',
      description: 'Copy selected row',
      callback: function(event, hotkey) {
        console.log('Copy selected row');
        event.preventDefault();
        $timeout(function() {
          $('[ng-click="copyRow()"]').click();
        }, 10);
      }
    });
    // Paste selected row
    hotkeys.add({
      combo: 'command+shift+v',
      description: 'Paste selected row',
      callback: function(event, hotkey) {
        console.log('Paste selected row');
        event.preventDefault();
        $timeout(function() {
          $('[ng-click="pasteRow()"]').click();
        }, 10);
      }
    });
    // Cut selected row
    hotkeys.add({
      combo: 'command+shift+x',
      description: 'Cut selected row',
      callback: function(event, hotkey) {
        console.log('Cut selected row');
        event.preventDefault();
        $timeout(function() {
          $('[ng-click="cutRow()"]').click();
        }, 10);
      }
    });
    // Move Up selected row
    hotkeys.add({
      combo: 'command+shift+up',
      description: 'Move Up selected Row',
      callback: function(event, hotkey) {
        console.log('Copy selected row');
        event.preventDefault();
        $timeout(function() {
          $(`[ng-click="moveRow('up')"]`).click();
        }, 10);
      }
    });
    // Move Down selected row
    hotkeys.add({
      combo: 'command+shift+down',
      description: 'Move Down selected Row',
      callback: function(event, hotkey) {
        console.log('Copy selected row');
        event.preventDefault();
        $timeout(function() {
          $(`[ng-click="moveRow('down')"]`).click();
        }, 10);
      }
    });



    // Read from localstorage
    $scope.loadFromLS = function(data) {
      // get latest one
      var temp = data || LocalStorageServ.get('jsnotebook') || {};
      // check load via url
      var contents = null;
      if ($routeParams.id) {
        contents = NotebookStorageServ.getContents($routeParams.id);
        if (contents) {
          temp = contents;
          $scope.notebook.uniqueId = temp.uniqueId;
        }
      }
      if (typeof temp.title === 'string' && temp.title !== 'Untitled') {
        $scope.notebook.title = temp.title;
      }
      if (typeof temp.video !== 'undefined') {
        $scope.notebook.video = temp.video;
      }
      if (temp.rows && temp.rows.length > 0) {
        // $scope.notebook.title = temp.title;
        // clean rows
        $scope.notebook.rows = [];
        temp.rows.forEach(function(row) {
          $scope.addRow(row);
        });
        $scope.notebook.config = {
          selected_row_pos: 0,
          selected_row_type: temp.rows[0].row_type
        };
        $scope.selected = $scope.notebook.config.selected_row_pos;
        $scope.activateSelection($scope.selected);
      } else {
        if (!contents) {
          // load deufault notebook
          $scope.loadNotebook();
        }
      }
    };

    $scope.validateNotebook = function(res) {
      if (res && typeof res.data !== 'undefined' && angular.isDefined(res.data.rows)) {
        $scope.loadFromLS(res.data);
        return true;
      }
      return false;
    }

    $scope.loadFromURL = function() {
      // Load from URL Example
      // http://127.0.0.1:3333/#/?url=https://raw.githubusercontent.com/cortezcristian/jsnotebook2/master/public/json/notebook-default.json
      // var defer = $q.defer();
      $http.get($routeParams.url)
        .then(function(res) {
          var loaded = $scope.validateNotebook(res);
          if (!loaded) {
            $scope.loadFromLS();
          }
        }).catch(function() {
          $scope.loadFromLS();
        });
      // return defer.promise;
    };

    // Check if load from URL is available
    if ($routeParams.url) {
      $scope.loadFromURL();
    } else {
      $scope.loadFromLS();
    }
    // Persist on localstorage
    $scope.$watch('notebook', function() {
      LocalStorageServ.set('jsnotebook', $scope.notebook);
      if ($scope.notebook.uniqueId) {
        NotebookStorageServ.setContents($scope.notebook.uniqueId, $scope.notebook);
      }
    }, true);

    // Modal instance open
    $scope.modal_open = false;

    // extra modals start
    $scope.openSaveAndRestore = function () {

      if($scope.modal_open){
        return;
      }else{
        $scope.modal_open = true;
        var modalInstance = $modal.open({
          //animation: $scope.animationsEnabled,
          templateUrl: $rootScope.config.app_domain+'/scripts/views/save-restore-dialog.html?ts='+Date.now(),
          controller: 'ModalSaveAndRestore',
          //size: size,
          resolve: {
            nbook: function () {
              return $scope.notebook;
            }
          }
        });

        modalInstance.result.then(function (f) {
          $scope.addToGrid = function(formData) {
            var data = {};
            angular.forEach(formData, function (value, key) {
                if(typeof value === 'object' && value.hasOwnProperty('$modelValue')) {
                    data[key] = value.$modelValue;
                }
            });

            if(data){
              if(data.importe){
                var newSourceCode = JSON.parse(data.importe);
                LocalStorageServ.set('jsnotebook', newSourceCode);
                // $scope.createNew(res.data);
                $scope.loadFromLS();
              }
            }

            $scope.modal_open = false;
          }

          $scope.addToGrid(f);
        },function () {
          $log.info('Modal dismissed at: ' + new Date());
          $scope.modal_open = false;
        });
      }
    }

    // Modal instance open
    $scope.modal_video_open = false;

    // extra modals start
    $scope.openVideoMilestones = function () {

      if($scope.modal_video_open){
        return;
      }else{
        $scope.modal_video_open = true;
        var modalInstance = $modal.open({
          //animation: $scope.animationsEnabled,
          templateUrl: $rootScope.config.app_domain+'/scripts/views/video-milestones-dialog.html?ts='+Date.now(),
          controller: 'ModalVideoMilestones',
          //size: size,
          resolve: {
            nbook: function () {
              return $scope.notebook;
            }
          }
        });

        modalInstance.result.then(function (data) {
            if(data && data.rows && data.video && data.video.actions){
                LocalStorageServ.set('jsnotebook', data);
                // $scope.createNew(res.data);
                $scope.loadFromLS();
            }

            $scope.modal_video_open = false;
        },function () {
          $log.info('Modal dismissed at: ' + new Date());
          $scope.modal_video_open = false;
        });
      }
    }

    // Open Spotlight
    hotkeys.add({
      combo: 'command+shift+space',
      description: 'Open Notebooks Search Dialog',
      callback: function(event, hotkey) {
        event.preventDefault();
        $('[data-toggle="ng-spotlight"]').click();
      }
    });


  })
  .controller('ModalSaveAndRestore', function ($scope, $http, $rootScope, $modalInstance,
    $modal, Restangular, $log, $timeout, nbook) {

    $scope.nbook = angular.copy(nbook);
      $scope.partida = {};
      $scope.partida.importe = '';



      $scope.save = function (formData) {
        $modalInstance.close(formData);
      };

      $scope.cancelar = function (event) {
        event.preventDefault();
        //event.stopPropagation();
        $modalInstance.dismiss('cancel');
      };

      $scope.partida.importe = JSON.stringify($scope.nbook) || '';
  })
  .controller('ModalVideoMilestones', function ($scope, $http, $rootScope, $modalInstance,
    $modal, Restangular, $log, $timeout, nbook) {

    $scope.nbook = angular.copy(nbook);
    $scope.newAction = {
      time: { start: 0, end: 1},
      row: 0,
    };


      $scope.partida = {};
      $scope.partida.importe = '';

      $scope.removeAction = function (event, actionIndex) {
        event.preventDefault();
        if (typeof $scope.nbook.video.actions[actionIndex] !== 'undefined') {
          $scope.nbook.video.actions.splice(actionIndex, 1);
        }
      };

      $scope.addAction = function(event) {
        event.preventDefault();
        $scope.nbook.video.actions.push($scope.newAction);
        $scope.newAction = {
          time: { start: 0, end: 1},
          row: 0,
        };
      };

      $scope.save = function (formData) {
        $modalInstance.close(formData);
      };

      $scope.cancelar = function (event) {
        event.preventDefault();
        //event.stopPropagation();
        $modalInstance.dismiss('cancel');
      };

      $scope.partida.importe = JSON.stringify($scope.nbook) || '';
  })
  .directive('smartrow', function($log, $http, $compile, $parse,
      $rootScope, $timeout, $templateCache){
     return {
       restrict: 'EA',
       scope: {
         rowmodel : '=rowmodel'
       },
       link: function(scope, element, attrs){
        // http://stackoverflow.com/questions/19501584/how-to-pass-in-templateurl-via-scope-variable-in-attribute


        /*
        scope.$watch(attrs.rowmodel, function (value) {
          if (value) {
            loadTemplate(value);
          }
        });
        */
         var templates = {
           'code': 'views/smartrow-editor.html',
           'asiento': 'views/smartrow-asiento.html',
           'markdown': 'views/smartrow-markdown.html',
           'formula': 'views/smartrow-formula.html'
         };


        if(scope.rowmodel && !scope.rowmodel.loaded){
          loadTemplate(scope.rowmodel);
        }

        function loadTemplate(item) {
          var template =  templates[item.row_type] || "";
          if(template !== "") {
            if (item.row_type === 'code') {
							configAce(item, scope, element);
            }
            $http.get($rootScope.config.app_domain+'/scripts/'+template, { cache: $templateCache })
              .then(function(templateContent) {
                console.log(template, templateContent);
                scope.rowmodel.loaded = true;
                element.html($compile(templateContent.data)(scope));
                // Configure Editor

                if (item.row_type !== 'code') {
                  var ts = item.ts;
                  $('[data-ts="'+ts+'"] textarea').on('keydown', function(event){
                    if (event.keyCode == 13 && event.shiftKey) {
                      event.preventDefault();
                      event.stopPropagation();
                      $log.log("Shift+Enter detected");
                      $(this).blur();
                      $timeout(function(){
                        // Mark All as Editing False
                        $rootScope.offEdditing();
                      },100);
                    }
                  });
                }
              });
          }
        }



       }
     };
				function configAce(item, scope, element){
					$log.log("ace: Config Ace", item);
				scope.aceLoaded = function(_editor){
					// Editor part
					var _session = _editor.getSession();
					var _renderer = _editor.renderer;

					// https://github.com/angular-ui/ui-ace/issues/64
					//$rootScope.editor = _editor;
					scope.aceEditor = _editor;

					// Options
					//_editor.setReadOnly(true);
					_session.setUndoManager(new ace.UndoManager());
					_renderer.setShowGutter(false);
					_editor.setHighlightActiveLine(false);

					// Interceptor
					_editor.commands.addCommand({
							name: "saveandrun",
							exec: function(ed) {
								$log.log("ace: Execute", item.rowtype);
								var script = ed.getValue();
								switch (item.row_type) {
									case 'code':

                    $http.post('/vm2', {
                      script: script,
                      item: item
                    }).then((res) => {
                      const result = res.data ? res.data.res : {};
                      const row = $rootScope.jsNotebook.rows.indexOf(item);
                      if(row !== -1){
                        $rootScope.jsNotebook.rows[row].stdout = result.stdout || '';
                        $rootScope.jsNotebook.rows[row].stderr = result.stderr || '';
                      }
                    });
										// ed.execCommand("turnoffedition");
									break;
									case 'markdown':
										//item['source'][0] = script;
										$log.log("Saving md:", item);
										ed.execCommand("turnoffedition");
										/*
										var ind = $rootScope.doc.data.indexOf(item);
										//item.editing = false;
										//scope.rowmodel.editing = false;
										// do it globally? root scope
										if(ind !== -1){
											// Set Editing False
											$rootScope.doc.data[ind].editing = false;
											// Emit Change
											//ed.session._emit('change')
											// enter selecciona todo;
											// otro enter borra todo;
											// stop propagation
											ed.blur();
											$log.log(scope.aceEditor);
											$timeout(function(){
											$rootScope.doc.data[ind].editing = false;
											scope.aceEditor.session._emit('change')
											},0)
											/*
											var newValue = scope.aceEditor.getValue();
											$log.log("new Value", newValue);
											scope.aceEditor.setValue(newValue);
										}
											*/
									break;
								}
							},
							bindKey: {mac: "shift-enter", win: "shift-enter"}
					});

					// Interceptor
					_editor.commands.addCommand({
							name: "turnoffedition",
							exec: function(ed) {
								$log.log("ace: Esc", item.rowtype);
								$log.log("Esc item:", item);
								var ind = $rootScope.jsNotebook.rows.indexOf(item);
								if(ind !== -1){
									$log.log("Set editing false: ", ind)
									// Set Editing False
									$rootScope.jsNotebook.rows[ind].editing = false;
									// Emit Change
									//ed.session._emit('change')
									//ed.renderer.updateFull();
									//ed.setValue(ed.getValue(), 1);
									//var script = ed.getValue();
									ed.blur();
									$timeout(function(){
										$rootScope.jsNotebook.rows[ind].editing = false;
										//$rootScope.triggerKeyDown($('body'), 40);
										try{
										scope.aceEditor.session._emit('change')
										}catch(e){
											$log.log("Error...");
											// $rootScope.doc.data[ind].editing = false;
										  $rootScope.jsNotebook.rows[ind].editing = false;
											scope.$apply();
										}
									},0)
								}
							},
							bindKey: {mac: "esc", win: "esc"}
					});

					// Events
					_editor.on("changeSession", function(){
						$log.log("ace: changeSession");
					});
					_session.on("change", function(){
						$log.log("ace: change");
					});

          // console.log(item);
					// Update lines
					var heightUpdateFunction = function() {
            // console.log(item);
            var lines = item.content.split('\n');
						var lineHeight = _editor.renderer.lineHeight || 20;

						// http://stackoverflow.com/questions/11584061/
						var newHeight =
											// _editor.getSession().getScreenLength()
											// * _editor.renderer.lineHeight
										  lines.length * lineHeight
											+ _editor.renderer.scrollBar.getWidth();

						element.find('.ace_editor').height(newHeight.toString() + "px");
						//$('.ace_editor-section').height(newHeight.toString() + "px");

						// This call is required for the editor to fix all of
						// its inner structure for adapting to a change in size
						_editor.resize();
				};

				// Set initial size to match initial content
				heightUpdateFunction();

				// Whenever a change happens inside the ACE editor, update
				// the size again
				_editor.getSession().on('change', heightUpdateFunction);


				};

			 }

   })
  .directive("mathjaxBind", function() {
    return {
      restrict: "A",
      controller: ["$scope", "$element", "$attrs", function($scope, $element, $attrs) {
        $scope.$on('$viewContentLoaded', function(){
          MathJax.Hub.Config({
            skipStartupTypeset: true,
            messageStyle: "none",
            "HTML-CSS": {
              showMathMenu: false
            }
          });
          MathJax.Hub.Configured();
        });
        $scope.$watch($attrs.mathjaxBind, function(value) {
          var $script = angular.element("<script type='math/tex'>")
            .html(value == undefined ? "" : value);
          $element.html("");
          $element.append($script);
          MathJax.Hub.Queue(["Reprocess", MathJax.Hub, $element[0]]);
        });
      }]
    };
  })
  .directive("asiento", function($rootScope, uiGridEditConstants,
    $timeout, $log) {
    return {
      restrict: "AE",
      scope: true,
      transclude: false,
      link: function(scope, element, attrs) {
      //controller: function($scope, $rootScope, uiGridEditConstants, $timeout, $log) {
        //var scope = scope ||Â $scope;

        if(scope.rowmodel.content === ""){
          scope.rowmodel.content = {
            title: 'Asiento Contable', lista: [],
            total: { debe: 0, haber: 0}
          };
          var inicial = {"categoria":"A+","concepto":"","debe":"","haber":""};
          scope.rowmodel.content.lista.push(inicial);
          scope.rowmodel.content.lista.push(angular.copy(inicial));
        }
        //scope.msg = scope.rowmodel;

        // Detect shift+enter
        $(element).on('keydown', function(event){
          $log.log("Keydown detected...");
          if (event.keyCode == 13 && event.shiftKey) {
            event.preventDefault();
            event.stopPropagation();
            $log.log("Shift+Enter detected");
            //$(this).blur();
            $timeout(function(){
              // Mark All as Editing False
              $rootScope.offEdditing();
            },100);
          }
        });

        // Data Source
        console.log("Lista:");
        //scope.lista = scope.rowmodel.content.lista;
        scope.lista = [];
        scope.lista_tshack = Date.now();
        scope.lista = scope.rowmodel.content.lista;

        // Watch rowmodel
        //scope.$watch("rowmodel.content.lista", function(lista) {
        scope.$watchCollection("lista", function(l) {
          scope.updateDebeHaber();
        });
        scope.$watch("lista_tshack", function(l) {
          scope.updateDebeHaber();
        });

        scope.updateDebeHaber = function(){
          var lista = scope.lista;
          $log.log("Lista change: ", lista);

          if(lista.length > 0){
            scope.rowmodel.content.total.debe = 0;
            scope.rowmodel.content.total.haber = 0;

            angular.forEach(lista, function(v){
              scope.rowmodel.content.total.debe += v.debe || 0;
              scope.rowmodel.content.total.haber += v.haber || 0;
            });
          }
        }


        // Categorias
        scope.lista_cat = "A+,A-,P+,P-,PN+,PN-,R+,R-".split(",");
        scope.onCellSelectedCombo = function(item, row, col){
          $log.log("Cell Edition Changed", item, row, col);
          //scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
          $log.log("End Cell Edit");
        }

        // Resize grid on editing true
        scope.$watch("rowmodel.editing", function(l) {
          if(scope.rowmodel.editing){
            $timeout(function(){
              $log.log("Resize grid on editing true");
              scope.gridApi.core.handleWindowResize();
              // Focus on title
              $(element).find(".asiento-title").focus();
            }, 1);
          }
        });


        // extra modals start
        scope.verAsiento = function () {
          $log.log("Ver asiento");
          scope.rowmodel.editing = false;
        };

        scope.addPartidaToGrid = function () {
          var data = { categoria: 'A+', concepto: '', debe: '', haber: ''};
          scope.lista.push(data);
          $log.log("Nueva lista", scope.lista);
        };

        scope.removePartsFromGrid = function(){
          var docs = scope.gridApi.selection.getSelectedRows();
          angular.forEach(docs, function(p){
            var index = scope.itemsGridOptions.data.indexOf(p);
            if (index !== -1) {
               scope.itemsGridOptions.data.splice(index, 1);
               scope.multipleSelected2--;
               $log.log("Removed", index);
            }
          });
        }

        // Initial selection
        scope.multipleSelected2 = 0;

        scope.itemsGridOptions = {};
        // Table fx starts
        scope.itemsGridOptions = {
          // Adding data source
          data: scope.lista,
          rowHeight: 38,
          enableSorting: false,
          enableColumnMenus: false,
          cellEditableCondition: function(scope) {
            // http://stackoverflow.com/questions/28347275/force-edit-mode-for-individual-rows-ui-grid-3-0
            // put your enable-edit code here, using values from scope.row.entity
            // and or scope.col.colDef as you desire
            var editable = false;
            if(scope.col.colDef.name.match(/debe|haber|concepto|categoria/) ){
              editable = true;
            }
            return editable;
          },
          columnDefs: [
            { name: 'categoria',
              displayName: "  ",
              //cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.categoria}}</div>',
              editableCellTemplate: '../scripts/views/ui-grid-edit-select-2.html',
              onCellSelectedCombo: scope.onCellSelectedCombo,
              editDropdownOptionsArray: scope.lista_cat,
              width: 60
            },
            {
              name: 'concepto',
              editable: true
            },
            { name: 'debe',
              width: 150,
              type: 'number',
              //editableCellTemplate: '../scripts/admin/views/grid-numeric-field-partida-debe.html'
              editable: true
            },
            { name: 'haber',
              width: 150,
              type: 'number',
              //editableCellTemplate: '../scripts/admin/views/grid-numeric-field-partida-haber.html'
              editable: true
            }
          ],
          onRegisterApi: function(gridApi) {
            scope.gridApi = gridApi;

            gridApi.selection.on.rowSelectionChanged(scope,function(row){
              var msg = 'row selected ' + row.isSelected;
              $log.log(msg);
              if(row.isSelected) {
                  scope.multipleSelected2++;
              } else {
                  scope.multipleSelected2--;
              }
            });

            gridApi.selection.on.rowSelectionChangedBatch(scope,function(rows){
              var msg = 'rows changed ' + rows.length;
              $log.log(msg);
              if(rows[0].isSelected){
                  scope.multipleSelected2 += rows.length;
              } else {
                  scope.multipleSelected2 -= rows.length;
              }
            });

            gridApi.edit.on.afterCellEdit(scope,function(row){
              $log.log("After cell edit");
              //row.importe = row.debe || row.haber;
              // try activate watcher
              scope.lista_tshack = Date.now();
              //scope.$apply();
            });

          }
        };
        /*
        */

        // Table fx ends
      }
    };
  })
  .directive("uiSelectWrap", function($document, uiGridEditConstants,
    $rootScope, $timeout, $log) {
    return {
      restrict: "AE",
      link: function(scope, element, attrs) {
        $document.on('click', docClick);
        $document.on('keyup', docIntro);
        function docClick(evt) {
          if ($(evt.target).closest('.ui-select-container').size() === 0) {
            scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
            $document.off('click', docClick);
          }
        }
        function docIntro(evt) {
          if (evt.keyCode == 13 &&
            $(evt.target).closest('.ui-select-container').size() === 1) {
            $log.log("Key up detected:", evt.keyCode);
            scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
            $document.off('keyup', docClick);
          }
        }
      }
    };
  }).factory('LocalStorageServ', function ($http, $window) {
    return {
      set: function(key, data) {
        return $window.localStorage.setItem(key, JSON.stringify(data));
      },
      get: function(key) {
        return JSON.parse($window.localStorage.getItem(key));
      },
      delete: function(key) {
        return $window.localStorage.removeItem(key);
      },
      clear: function() {
        return $window.localStorage.clear();
      },
    };
  }).factory('NotebookStorageServ', function (LocalStorageServ) {
    var notebooksIndex = LocalStorageServ.get('nb_index') || [];
    return {
      list: function() {
      },
      search: function(keyword) {
        var notebooksIndex = LocalStorageServ.get('nb_index') || [];
        var notebooks = [];
        var regex = new RegExp('.*'+keyword+'.*', 'gim');
        notebooksIndex.forEach(function(id) {
          var nb = LocalStorageServ.get(id);
          // nb.initial = nb.title[0];
          notebooks.push(nb);
        });

        return notebooks.filter(function (n) {
          return n && n.title && n.title.match(regex);
        });
      },
      create: function(id, contents) {
        var notebooksIndex = LocalStorageServ.get('nb_index') || [];
        notebooksIndex.push(id);
        LocalStorageServ.set('nb_index', notebooksIndex);
      },
      getContents: function(id) {
        return LocalStorageServ.get(id);
      },
      setContents: function(id, notebook) {
        LocalStorageServ.set(id, notebook);
      },
      remove: function(id) {
        LocalStorageServ.delete(id);
      },
    };
  });
