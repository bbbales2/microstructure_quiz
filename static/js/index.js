var Index = Index || {}

var samples = [
    { path : '/static/images/created/GTD444_1245_0pct_10000x_Transverse_DendriteCore.TIF.png', real : false},
    { path : '/static/images/created/ReneN5_1238_1079_5pct_10000x_Transverse_DendriteCore.TIF.png', real : false},
    { path : '/static/images/created/ReneN5_1251_1079_2pct_10000x_Transverse_Interdendritic.TIF.png', real : false},
    { path : '/static/images/created/ReneN5_1264_1079_0pct_10000x_Transverse_DendriteCore.TIF.png', real : false},
    { path : '/static/images/created/ReneN5_1278_1079_2pct_10000x_Transverse_DendriteCore.TIF.png', real : false},
    { path : '/static/images/created/ReneN5_1293_2pct_10000x_Transverse_DendriteCore.TIF.png', real : false},
    { path : '/static/images/created/ReneN5_1293_5pct_10000x_Transverse_DendriteCore.TIF.png', real : false},
    { path : '/static/images/reference/GTD444_1229_0pct_10000x_Transverse_Interdendritic.TIF.png', real : true },
    { path : '/static/images/reference/ReneN5_1238_1079_5pct_10000x_Transverse_Interdendritic.TIF.png', real : true },
    { path : '/static/images/reference/ReneN5_1251_1079_0pct_10000x_Transverse_DendriteCore.TIF.png', real : true },
    { path : '/static/images/reference/ReneN5_1251_1079_0pct_10000x_Transverse_Interdendritic.TIF.png', real : true },
    { path : '/static/images/reference/ReneN5_1278_0pct_10000x_Transverse_DendriteCore.TIF.png', real : true }
];

samples = _.shuffle(samples);

var grade = function()
{
    variables.correct = 0;

    for(var i in variables.answers)
    {
	variables.correct += Number(variables.answers[i] == samples[i].real);
    }

    variables.total = variables.answers.length;

    $.ajax( {
        url : '/accept_score',
        data : { variables : JSON.stringify(variables), samples : JSON.stringify(samples) },
        dataType : 'json',
        method : 'POST'
    } );
}

var verifyName = function()
{
    if($( "#input1" ).val().trim().length == 0)
	return '0.1';
    else
    {
	variables['name'] = $( "#input1" ).val().trim();

	return '1';
    }
}

var randomQuery = function()
{
    var responses = ['So confident? Here\'s another.',
		     'How about this?',
		     'Here\'s another',
		     'What do you say?',
		     'Is this real?']

    return responses[Math.floor(Math.random() * responses.length)];
}

var randomPositive = function()
{
    var responses = ['That\'s real',
		     'That\'s definitely real',
		     'I\'m pretty sure it\'s real',
		     'Real',
		     'Probably real',
		     'Maybe?'];

    return responses[Math.floor(Math.random() * responses.length)];
}

var randomNegative = function()
{
    var responses = ['No way',
		     'That\'s definitely not real',
		     'Fake',
		     'Pretty sure that\'s fake',
		     'Probably not real',
		     'Maybe fake?'];

    return responses[Math.floor(Math.random() * responses.length)];
}

var variables = { answers : [] };

var flow = {
    '0' : ['Hello, I\'m Frog. What is your name?', [
	{
	    target : '#input1',
	},
	{
	    target : '#opt1',
	    text : '>>',
	    nextState : verifyName
	}]],
    '0.1' : ['No it\'s not, what is your name?', [
	{
	    target : '#input1',
	},
	{
	    target : '#opt1',
	    text : '>>',
	    nextState : verifyName
	}]],
    '1' : ['Oh yes, <%= name %>, I remember you now.', [
        {
            target : '#opt1',
            text : 'Wonderful',
            nextState : 2
        }]],

    '2' : ['Sometimes my memory gets <b>froggy</b>.', [
        {
            target : '#opt1',
            text : '...',
            nextState : 3
        }]],

    '3' : ['Would you like to play a game?', [
        {
            target : '#opt1',
            text : 'Yes',
            nextState : function() { variables['plays'] = true; return '4'}
        },
        {
            target : '#opt2',
            text : 'No',
            nextState : function() { variables['plays'] = true; return '5'}
        }]],

    '4' : ['You want to play a game?! Why would you say that?', [
        {
            target : '#opt1',
            text : 'I wa...',
            nextState : 6
        }]],

    '5' : ['Good', [
        {
            target : '#opt1',
            text : 'Why?',
            nextState : 6
        }]],

    '6' : ['We\'re very serious here', [
        {
            target : '#opt1',
            text : '>>',
            nextState : 7
        }]],

    '7' : ['Or so I\'ve been <b>toad</b>.', [
        {
            target : '#opt1',
            text : '...',
            nextState : 8
        }]],

    '8' : ['This is our micrograph room.', [
        {
            target : '#opt1',
            text : '>>',
            nextState : 9
        }]],

    '9' : ['It\'s filled with very real micrographs of very real microstructures.', [
        {
            target : '#opt1',
            text : 'I\'m not so sure',
            nextState : 10
        },
        {
            target : '#opt2',
            text : 'What does that mean?',
            nextState : 11
        }]],

    '10' : ['And I\'m an amphibian.', [
        {
            target : '#opt1',
            text : '>>',
            nextState : 12
        }]],

    '11' : ['Who knows? Certainly not me. I\'m just the butler.', [
        {
            target : '#opt1',
            text : '>>',
            nextState : 12
        }]],

    '12' : ['Let\'s look at these micrographs!', [
        {
            target : '#opt1',
            text : '>>',
            nextState : 13
        }]],

    '13' : ['Here\'s one.', [
	{
	    target : "#img",
	    src : function() { return samples[variables.answers.length].path; }
	},
        {
            target : '#opt1',
            text : randomPositive,
            nextState : function() { variables.answers.push(true); return '14'; }
        },
        {
            target : '#opt2',
            text : randomNegative,
            nextState : function() { variables.answers.push(false); return '14'; }
        }]],

    '14' : [randomQuery, [
	{
	    target : "#img",
	    src : function() { return samples[variables.answers.length].path; }
	},
        {
            target : '#opt1',
            text : randomPositive,
            nextState : function() { 
		variables.answers.push(true);
		if(variables.answers.length == 5)
		    return '15';
		else if(variables.answers.length == 10)
		    return '16';
		return '14';
	    }
        },
        {
            target : '#opt2',
            text : randomNegative,
            nextState : function() {
		variables.answers.push(false);
		if(variables.answers.length == 5)
		    return '15';
		else if(variables.answers.length == 10)
		    return '16';
		return '14'
	    },
	}]],

    '15' : ['I hope you are finding this <b>ribbeting</b>. Just a few more to go.', [
        {
            target : '#opt1',
            text : '...',
            nextState : '14'
        }]],

    '16' : ['*Yawn*, I believe I\'ve done enough for today', [
        {
            target : '#opt1',
            text : 'Me too',
            nextState : 18
        },
        {
            target : '#opt2',
            text : 'Not yet',
            nextState : 17
        }]],

    '17' : ['It\'s unhealthy to work this late.', [
        {
            target : '#opt1',
            text : 'Indeed',
            nextState : '18'
        }]],

    '18' : ['Oh yes, one more thing', [
        {
            target : '#opt1',
            text : 'Oh...?',
            nextState : function() { grade(); return '19'; }
        }]],

    '19' : ['<%= correct %> / <%= total %>', [
        {
            target : '#opt1',
            text : '>>',
            nextState : function() { window.location = '/scores'; }
        }]],
};

Index.Controller = Backbone.View.extend(
    {
        events : {
        },

        initialize : function(options)
	{
	    this.state = null;
        },

	transition : function(state)
	{
	    if(_.isFunction(state))
	    {
		state = state();
	    }
	    
	    //if(state == this.state)
	    //return;

	    this.state = state;

	    this.$el.find( '#innerContent' ).fadeOut(400, _.bind(this.finishTransition, this));
	},

	finishTransition : function()
	{
	    var setup = flow[this.state];

	    var message = setup[0];

	    if(_.isFunction(message))
		message = message();

	    this.$el.find( '#message' ).html(_.template(message)(variables));

	    this.$el.find( 'button, input, img' ).unbind().hide();

	    for(var i in setup[1])
	    {
		var action = setup[1][i];

		var el = this.$el.find(action.target);

		el.show();

		if(typeof(action.text) != 'undefined')
		    el.html(action.text);

		if(typeof(action.src) != 'undefined')
		{
		    var src = action.src;

		    if(_.isFunction(src))
			src = src();

		    el.prop('src', src);
		}

		if(typeof(action.nextState) != 'undefined')
		    el.click(_.bind(_.partial(this.transition, action.nextState), this));
	    }

	    this.$el.find( '#innerContent' ).fadeIn(400);
	},

        render : function()
        {
            this.$el = $("body");
            this.el = this.$el[0];

            //this.data = $.parseJSON(this.$el.find( '.data' ).text());

            this.$el.find( '#innerContent' ).show();

            this.state = '0';

	    this.finishTransition();
            this.delegateEvents();
        },
    }
);

$( document ).ready( function() {
    var cont = new Index.Controller();
    
    cont.render();
});

