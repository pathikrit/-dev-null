import $ from 'jQuery'
import React from 'react'
import { giver } from './App'
import { SuccessNotification, DangerNotification } from './Notification'

const KEYS = {
  ENTER: 13
}

export default class SettingsView extends React.Component {

  constructor (_) {
    super(_)
    this.state = {}
    this.clearForm()
  }

  componentDidMount() {
    this.getEndpoints()
  }

  getEndpoints() {
    giver
      .askFor('endpoints')
      .then(endpoints => {
        this.setState({ endpoints: endpoints })
      })
  }

  handleChange (fieldName: string) {
    return event => {
      // setting state directly because React lacks
      // support for patch updating objects
      this.state.form[fieldName] = event.target.value
      this.forceUpdate()
    }
  }

  onKeyPress (event: SyntheticKeyboardEvent) {
    if (event.which == KEYS.ENTER) {
      event.preventDefault()
      this
        .save()
        .then(() => {

          new SuccessNotification(
            <span>Successfully created new endpoint "<strong>{ this.state.form.nickname || this.state.form.url }</strong>"</span>
          )

          this.clearForm()
          this.getEndpoints()
        })
        .catch(err => console.error(err))
    }
  }

  clearForm() {

    this.state.form = {
      nickname: null,
      url: null,
      username: null,
      password: null
    }

  }

  save() {

    if (!this.formIsCompleted()) {
      return new Promise((_, reject) => reject(new Error('Attempted to save new endpoint without filling in required fields')))
    }

    // if the user didn't enter a nickname,
    // use the url as the nickname
    if (this.state.form.url && !this.state.form.nickname) {
      this.state.form.nickname = this.state.form.url
    }

    if (this.isDuplicate(this.state.form.nickname)) {
      return new Promise((_, reject) => reject(new Error(`An endpoint with the nickname ${ this.state.form.nickname } already exists! Nicknames must be unique`)))
    }

    return new Promise((resolve, reject) => {
      $
      .ajax({
        data: JSON.stringify(this.state.form),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST',
        processData: false,
        url: '/user/endpoints'
      })
      .done(resolve)
      .fail(reject)
    })

  }

  isDuplicate (nickname: string): boolean {
    return this.state.endpoints.some(
      _ => _.nickname == nickname
    )
  }

  formIsCompleted(): boolean {
    return this.state.form.url
  }

  render() {

    if (!this.state.endpoints) {
      return <div>Getting endpoints...</div>
    }

    const label = (value) => {
      return (
        <label className="quarter-width">
          <input type="text" value={ value } disabled />
        </label>
      )
    }

    const endpoints = this.state.endpoints.map(_ => {
      return <li key={ _.nickname }>{ label(_.nickname) }{ label(_.url) }{ label(_.user) }</li>
    })

    const button = this.formIsCompleted()
      ? <button className="press-enter" onClick={ this.save.bind(this) }>Press <kbd>enter</kbd> to save</button>
      : ''

    return (
      <div className="SettingsView">

        <h2>Add New Endpoint:</h2>

        <form onKeyPress={this.onKeyPress.bind(this)}>
          <label className="quarter-width">
            Nickname
            <input
              type="text"
              placeholder="Prod DB"
              value={this.state.form.nickname || this.state.form.url}
              onChange={this.handleChange('nickname')} />
          </label>
          <label className="quarter-width">
            URL
            <input
              type="url"
              placeholder="mysql://dev-db.cow.com:3306"
              required
              value={this.state.form.url}
              onChange={this.handleChange('url')} />
          </label>
          <label className="quarter-width">
            Username
            <input
              type="text"
              value={this.state.form.username}
              onChange={this.handleChange('username')} />
          </label>
          <label className="quarter-width">
            Password
            <input
              type="password"
              value={this.state.form.password}
              onChange={this.handleChange('password')} />
          </label>

          { button }

        </form>

        <h2>My Endpoints ({ endpoints.length }):</h2>

        <ul>{ endpoints }</ul>

      </div>
    )
  }

}