import _ from 'lodash'
import $ from 'jquery'
import React from 'react'
import ProgressBar from 'progressbar.js'

import Random from 'random-js'

let rt = new Random(Random.engines.mt19937().seed(1))

require('howler')

let StepView = React.createClass({

    play(){

        let step = this.props.step
        let duration = step.duration
        let command = step.command

        if (command == 'rest'){

            setTimeout(()=>{
                this.props.onFinish()
            }, duration)

        } else if (command == 'sound'){

            this.sound = new Howl({
              urls: [`/wav/${step.filename}`],
              autoplay: true,
              loop: true,
              volume: 1.0,
              onend: function() {
                console.log('Finished!');
              }
            })

            setTimeout(()=>{
                this.sound.stop()
                this.props.onFinish()
            }, duration)
        }

        if (command == 'rest' || command == 'sound'){
            if (!this.circle){
                this.circle = new ProgressBar.Circle('#progress', {
                    color: '#FCB03C',
                    strokeWidth: 5,
                    trailWidth: 1,
                    text: {
                        value: '0'
                    },
                    step: function(state, bar) {
                        bar.setText((bar.value() * duration / 1000).toFixed(0));
                    }
                })
            }

            this.circle.set(0)
            this.circle.animate(1, {duration: duration, step: function(state, bar) {
                bar.setText((bar.value() * duration / 1000).toFixed(0));
            }})
        }
    },

    componentDidMount() {
        // let duration = this.props.step.duration



        this.play()
    },

    nextButtonPress: function(){
        this.props.onFinish()
    },

    componentDidUpdate: function(){
        this.play()
    },

    render(){
        console.log('render step view', this.props.step)

        if (this.props.step.command == 'slide'){

            return <div>
                    <h1>{this.props.step.text}</h1>
                    <button className="btn btn-primary mb1 bg-olive"
                        onClick={this.nextButtonPress}>Next
                    </button>
                </div>

        } else {

            return <div>
                    <h1>{this.props.step.command} {this.props.step.filename} {(this.props.step.duration / 1000).toFixed(0)} seconds</h1>
                    <div ref="progress" id="progress">
                    </div>
                </div>
        }
    }

})

let SequenceView =  React.createClass({

    getInitialState(){
        return {
            index: 0
        }
    },

    onFinishStep() {
        console.log('finish ', this.state.index)
        let nextIndex = this.state.index + 1
        this.setState({index: nextIndex})
    },

    render(){

        let items = _.map(this.props.sequence, (step, i) =>{
            return <li className={ i == this.state.index ? 'current' : ''}>{step.command} {step.filename}</li>
        })

        let view
        let index = this.state.index
        let step = this.props.sequence[index]
        if (step){
            view =  <StepView
                        step={step}
                        onFinish={this.onFinishStep}
                    />
        } else {
            view = <h1>Done</h1>
        }

        return <div className="clearfix border">
                <div className="col col-3 border p1 overflow-auto" style={{maxHeight:'100%'}} >

                    <ol className="mt2 mb2">
                        {items}
                    </ol>

                </div>
                <div className="col col-9 p1">
                    {view}
                </div>
                </div>
    }
})


function generate(){

    let filenames = [
        '3000_angry.wav',
        '3000_neutral.wav',
        '3000_angry.wav',
        '3000_sad.wav',
        'control_angry.wav',
        'control_neutral.wav',
        'control_angry.wav',
        'control_sad.wav'
    ]

    // filenames = _.shuffle(filenames)

    let sequence = _.map(filenames, filename =>{
        return  {
                command: 'sound',
                duration: 20000,
                filename
        }
    })

    let repeats = []
    _.times(5, () =>{
        repeats.push(sequence)
    })

    sequence = _.flatten(repeats,true)
    rt.shuffle(sequence)

    // insert rest breaks

    sequence = _.map(sequence, s => {
        return [s, {
            command: 'rest',
            duration: 2000
        }]
    })

    sequence = _.flatten(sequence)

    // prepend slides
    let beginning = [
        {command:'slide',text:'Check if the scanner is ready'},
        {command:'slide',text:'When ready, click Next to start'},
        {command:'rest',duration: 5000}
    ]

    sequence = beginning.concat(sequence)

    return sequence
}


let sequence = generate()
var div = $('#app')[0]
var app = React.createElement(SequenceView, {sequence})
React.render(app, div)
