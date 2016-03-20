var Index = Index || {}

var userName = 'test';

var gameFlow = {
    1 : ['Oh yes, {% name %}, I remember you now', [
        {
            target : '#opt1',
            text : 'Wonderful',
            nextState : 2
        }]],

    2 : ['I apologize -- sometimes my memory gets froggy', [
        {
            target : '#opt1',
            text : '...',
            nextState : 3
        }]],

    3 : ['Would you like to play a game?', [
        {
            target : '#opt1'
            text : 'Yes',
            nextState : 4,
            record : 'playsGames'
        },
        {
            target : '#opt2'
            text : 'No',
            nextState : 5,
            record : 'noGames'
        }]],

    4 : ['Then why did you come to Frog Hall?', [
        {
            target : '#opt1',
            text : 'I wa...',
            nextState : 6
        }]],

    5 : ['Good', [
        {
            target : '#opt1',
            text : 'Why?',
            nextState : 6
        }]],

    5 : ['We\'re very serious here', [
        {
            target : '#opt1',
            text : '>>',
            nextState : 6
        }]],

    6 : ['Or so I\'ve been toad', [
        {
            target : '#opt1',
            text : '...',
            nextState : 7
        }]],
};

Index.Controller = Backbone.View.extend(
    {
        events : {
        },

        initialize : function(options)
        {
        },

        ajax : function(choice, line, gameId)
        {
            $.ajax( {
                url : '/',
                data : {  },
                dataType : 'json',
                method : 'POST',
                success : _.bind(this.succeeded, this),
                error : _.bind(this.failed, this)
            } );
        },

        render : function()
        {
            this.$el = $("body");
            this.el = this.$el[0];

            this.data = $.parseJSON(this.$el.find( '.data' ).text());

            this.delegateEvents();
        },
    }
);

$( document ).ready( function() {
    var cont = new Index.Controller();
    
    cont.render();
});

