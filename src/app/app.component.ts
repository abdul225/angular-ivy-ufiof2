import { Component, VERSION } from '@angular/core';
import AgoraRTC, { ClientConfig } from 'agora-rtc-sdk-ng';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  name = 'Angular ' + VERSION.major;
  uid;

  localTracks = {
    videoTrack: null,
    audioTrack: null,
  };
  remoteUsers = {};
  // Agora client options
  options = {
    appid: '9e17cc4e397e4d288d27abc2824354ae',
    channel: 'livechannel',
    uid: null,
    token:
      '0069e17cc4e397e4d288d27abc2824354aeIABXI3voTUJMvlrDwIxxEBs60GDQ1I0O7p8yrAXa0Q4W1BDfnDgAAAAAEADL5xHfvp4IYgEAAQC+nghi',
    role: 'audience', // host or audience
    audienceLatency: 2,
  };
  playerName: any;
  playerId: string;
  client: any;
  client1: any;
  async start() {
    this.client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
    console.log('called in start!!!!!!!!!!!!!!', this.options.role);
    try {
      await this.join();
      // if (this.options.role === 'host') {
      //   // $("#success-alert a").attr("href", `index.html?appid=${options.appid}&channel=${options.channel}&token=${options.token}`);
      //   // if (this.options.token) {
      //   //     $("#success-alert-with-token").css("display", "block");
      //   // } else {
      //   //     $("#success-alert a").attr("href", `index.html?appid=${options.appid}&channel=${options.channel}&token=${options.token}`);
      //   //     $("#success-alert").css("display", "block");
      //   // }
      // }
    } catch (error) {
      console.error(error);
    } finally {
      //$('#leave').attr('disabled', false);
    }
  }

  async join() {
    if (this.options.role === 'audience') {
      this.client.setClientRole(this.options.role, {
        level: this.options.audienceLatency,
      });
      // add event listener to play remote tracks when remote user publishs.
      this.client.on('user-published', this.handleUserPublished);
      this.client.on('user-unpublished', this.handleUserUnpublished);
      console.log('called in join!!!!!!!!!!!!!!');
    } else {
      //this.client.setClientRole('host');
    }
    // join the channel
    this.options.uid = await this.client.join(
      this.options.appid,
      this.options.channel,
      this.options.token || null,
      this.options.uid || null
    );

    if (this.options.role === 'host') {
      // create local audio and video tracks
      this.localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      this.localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();
      // play local video track
      this.localTracks.videoTrack.play('localplayer');
      this.playerName = this.options.uid;
      // publish local tracks to channel
      await this.client.publish(Object.values(this.localTracks));
      console.log('publish success!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    }
  }

  async leave() {
    for (const trackName in this.localTracks) {
      var track = this.localTracks[trackName];
      if (track) {
        track.stop();
        track.close();
        this.localTracks[trackName] = undefined;
      }
    }

    // remove remote users and player views
    this.remoteUsers = {};
    //$('#remote-playerlist').html('');

    // leave the channel
    await this.client.leave();

    // $("#local-player-name").text("");
    // $("#host-join").attr("disabled", false);
    // $("#audience-join").attr("disabled", false);
    // $("#leave").attr("disabled", true);
    console.log('client leaves channel success');
  }

  async hello(user: any, mediaType: any) {
    console.log('subscribe called!!!!!!!!!!!!!!!!!!!!!');
    this.uid = user.uid;
    this.playerId = 'player-' + this.uid;
    console.log('subscribe called!!!!!!!!!!!!!!!!!!!!!', this.client);
    // subscribe to a remote user
    await this.client.subscribe(user, mediaType);

    if (mediaType === 'video') {
      //   const player = $(`
      //   <div id="player-wrapper-${uid}">
      //     <p class="player-name">remoteUser(${uid})</p>
      //     <div id="player-${uid}" class="player"></div>
      //   </div>
      // `);
      // $('#remote-playerlist').append(player);

      console.log(
        'the player id is!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ',
        this.playerId
      );
      user.videoTrack.play(`azeem`, { fit: 'contain' });
    }
    if (mediaType === 'audio') {
      console.log(
        'the player id is!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ',
        this.playerId
      );
      user.audioTrack.play();
    }
  }

  handleUserPublished(user: any, mediaType: any) {
    const id = user.uid;
    //this.uid = user.uid;
    console.log('handle user publish has been called!!!!!!!!!!!!', user, id);
    this.remoteUsers[id] = user;
    this.hello(user, mediaType);
    console.log(
      'handle user publish has been ended!!!!!!!!!!!!',
      id,
      user,
      mediaType
    );
  }
  handleUserUnpublished(user, mediaType) {
    if (mediaType === 'video') {
      const id = user.uid;
      delete this.remoteUsers[id];
    }
  }
}
