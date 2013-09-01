/*
 * OS X Dashboard widget for your xkcd.com webcomic viewing pleasure.
 *
 * Copyright (c) 2013 Jess Thrysoee, http://thrysoee.dk/xkcd
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */

/*globals widget, Spinner, AppleGlassButton, AppleInfoButton */

(function() {
   'use strict';

   var xhr, data, last, spinner, history, doneButton, infoButton;

   main();

   /**
    *
    */

   function main() {
      spinner = new Spinner();
      history = historyFn();
      keyboardNav();
      buttonNav();
      externalNav();
      widgetSetup();
      getEmpty();
      get();

      //document.documentElement.classList.add('back');
   }

   /**
    *
    */

   function widgetSetup() {
      if (!('widget' in window)) {
         return;
      }

      doneButton = new AppleGlassButton($('done-button'), "Done", hidePrefs);
      infoButton = new AppleInfoButton($('info-button'), $('front'), 'white', 'white', showPrefs);
      infoButton.setStyle('black', 'black');
   }

   /**
    *
    */

   function showPrefs() {
      widget.prepareForTransition("ToBack");
      document.documentElement.classList.add('back');
      setTimeout(function() {
         widget.performTransition();
      }, 0);
   }

   /**
    *
    */

   function hidePrefs() {
      widget.prepareForTransition("ToFront");
      document.documentElement.classList.remove('back');
      setTimeout(function() {
         widget.performTransition();
      }, 0);
   }

   /**
    * used for initialization of widget
    */

   function getEmpty() {
      xhr = new XMLHttpRequest();
      xhr.onload = xhrload;
      xhr.open('GET', 'empty.json', false);
      xhr.send();
   }


   /**
    * fetch comic number <num>; if <num> is undefined get latest comic
    */

   function get(num) {
      var segment = num ? '/' + num : '';

      last = num ? last : null; // refresh last when getting lastest comic

      spinner.spin(document.body);

      xhr = new XMLHttpRequest();
      xhr.onload = xhrload;
      xhr.open('GET', 'http://xkcd.com' + segment + '/info.0.json', true);
      xhr.send();
   }

   /**
    *
    */

   function xhrload() {
      var img;

      if (xhr.status === 200 || xhr.status === 0) {
         data = JSON.parse(xhr.responseText);
         last = last || data.num;

         img = new Image();
         img.onload = imgload;
         img.src = data.img;
      } else {
         spinner.stop();
         log('Failed with HTTP status:', xhr.status, xhr.statusText);
      }
   }

   /**
    *
    */

   function imgload() {
      spinner.stop();

      $('alt-container').classList.remove('alt-container-slowblur');
      $('alt-container').classList.remove('hover');

      $('title').innerHTML = data.title;
      $('alt').innerHTML = data.alt;
      $('img').src = data.img;

      setTimeout(function() {
         $('alt-container').classList.add('alt-container-slowblur');
      }, 0);

      buttonState(data.num);

      window.resizeTo(document.body.offsetWidth, document.body.offsetHeight);
   }

   /**
    *
    */

   function buttonState(num) {
      var cl = 'inactive';

      function active(id) {
         $(id).classList.remove(cl);
      }

      function inactive(id) {
         $(id).classList.add(cl);
      }

      if (num === 1) {
         inactive('first');
         inactive('prev');
         active('next');
         active('last');

      } else if (num === last) {
         active('first');
         active('prev');
         inactive('next');
         inactive('last');

      } else {
         active('first');
         active('prev');
         active('next');
         active('last');
      }
   }

   /**
    *
    */

   function first() {
      history.add(data.num);
      get(1);
   }

   /**
    *
    */

   function prev() {
      history.add(data.num);
      get(Math.max(data.num - 1, 1));
   }

   /**
    *
    */

   function random() {
      history.add(data.num);
      get(Math.floor(Math.random() * last) + 1);
   }

   /**
    *
    */

   function next() {
      history.add(data.num);
      get(Math.min(data.num + 1, last));
   }

   /**
    *
    */

   function getLast() {
      get();
   }

   /**
    *
    */

   function buttonNav() {

      // nav buttons
      $('nav').addEventListener('click', function(e) {
         var id = e.target.id;

         e.preventDefault();

         if (e.target.classList.contains('inactive')) {
            return;
         }

         if (id === 'first') {
            first();

         } else if (id === 'prev') {
            prev();

         } else if (id === 'random') {
            random();

         } else if (id === 'next') {
            next();

         } else if (id === 'last') {
            getLast();
         }
      }, false);
   }

   /**
    *
    */

   function keyboardNav() {

      document.addEventListener('keydown', function(e) {

         if (e.keyCode === 37 && e.shiftKey) {
            get(history.prev(data.num));

         } else if (e.keyCode === 37) {
            prev();

         } else if (e.keyCode === 38) {
            random();

         } else if (e.keyCode === 39 && e.shiftKey) {
            get(history.next());

         } else if (e.keyCode === 39) {
            next();

         } else if (e.keyCode === 40) {
            $('alt-container').classList.toggle('hover');
         }
      }, false);

   }

   /**
    * setup click handlers for navigation in external browser
    */

   function externalNav() {

      // title
      $('title').addEventListener('click', function(e) {
         e.preventDefault();

         openURL('http://xkcd.com/' + data.num);
      }, false);


      // homepage
      $('homepage').addEventListener('click', function(e) {
         e.preventDefault();

         openURL(e.target.href);
      }, false);
   }

   /**
    *
    */

   function openURL(url) {
      if ('widget' in window) {
         widget.openURL(url);
      } else {
         location.href = url;
      }
   }

   /**
    * navigation history, i.e. like browser history back/forward buttons
    */

   function historyFn() {
      var entries, index;

      function fn() {
         entries = [];
         index = 0;

         return fn;
      }

      fn.add = function(entry) {
         entries = entries.slice(0, Math.max(0, index));
         entries.push(entry);
         index += 1;
      };

      fn.prev = function(entry) {
         // save current entry if previous navigation wasn't a history navigation
         if (index === entries.length) {
            entries.push(entry);
         }
         index -= 1;
         index = Math.max(0, index);
         return entries[index];
      };

      fn.next = function() {
         index += 1;
         index = Math.min(entries.length - 1, index);
         return entries[index];
      };

      fn.stat = function() {
         log('back:', entries.slice(0, index), 'forward:', entries.slice(index));
      };

      return fn();
   }

   /**
    * a little helper
    */

   function $(id) {
      return document.getElementById(id);
   }

   /**
    * debug function
    */

   function log() {
      var msg = [].slice.call(arguments).join(arguments.length === 1 ? '' : ' ');

      if ('widget' in window) {
         window.alert(msg); // can be viewed in Console.app
      } else {
         console.log(msg);
      }
   }

}());
