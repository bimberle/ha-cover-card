// BASIS: Multiple Entity Row


((LitElement) => {
    console.info(
        '%c KECH-COVER-ROW %c 1.0.0 ',
        'color: cyan; background: black; font-weight: bold;',
        'color: darkblue; background: white; font-weight: bold;',
    );
  
    const html = LitElement.prototype.html;
    const css = LitElement.prototype.css;
  
    const UNAVAILABLE = 'unavailable';
    const UNKNOWN = 'unknown';
    const longpress = 1000;
  
    class KechCoverRow extends LitElement {
  
        static get properties() {
            return {
                _hass: {},
                _config: {},
                state: {}
            }
        }
  
        static get styles() {
            return css`
  
            :host {
              display: flex;
              align-items: center;
            }
            
            state-badge {
              flex: 0 0 40px;
              cursor: pointer;
            }
            .entity {
              margin-right: 16px;
              text-align: center;
              cursor: pointer;
            }
            .entity span {
              font-size: 10px;
              color: var(--secondary-text-color);
            }
            .entity:last-of-type {
              margin-right: 0;
            }
            .state {
              min-width: 45px;
            }
  
            .secondary, ha-relative-time {
              display: block;
              color: var(--secondary-text-color);
            }
  
            .info {
              margin-left: 16px;
              margin-right: 8px;
              flex: 1 0 30%;
            }
            .info, .info > * {
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .entities-row {
              flex-direction: row;
              display: inline-flex;
              justify-content: space-between;
              align-items: center;
            }
            .flex {
              flex: 1;
              display: flex;
              justify-content: space-between;
              align-items: center;
              min-width: 0;
            }
            .updown {
              padding-left:20px;
            }
  
            ha-icon {
              cursor:pointer;
            }
            `;
        }
  
        //<hui-generic-entity-row hass="[[_hass]]" config="[[_config]]">
            
        render() {
            return html`
  
              <state-badge
                  .stateObj="${this.state.stateObj}"
                  @click="${this.moreInfoAction(this.state.stateObj.entity_id)}">
              </state-badge>
              <div class="flex">
                  <div class="info" @click="${this.onRowClick}">
                      ${this.state.stateObj.attributes.friendly_name}
                      <div class="secondary">${this.invertPercentage(this.state.stateObj.attributes.current_position)}% / ${this.invertPercentage(this.state.stateObj.attributes.current_tilt_position)}%</div>
                  </div>
                  <div class="entities-row">
                    <ha-icon @click=${e=>this.setTilt(this.state.stateObj.entity_id)} class="clickIcon" icon="mdi:cached"></ha-icon>
                    <ha-icon @click=${e=>this.setPositionAndTilt(this.state.stateObj.entity_id,0,50)} class="clickIcon" icon="mdi:reorder-horizontal"></ha-icon>
                    <div class="updown">
                      <ha-icon @click=${e=>this.closeCover(this.state.stateObj.entity_id)} class="clickIcon" icon="mdi:chevron-down"></ha-icon>
                      <ha-icon @click=${e=>this.stopCover(this.state.stateObj.entity_id)} class="clickIcon" icon="mdi:pause"></ha-icon>
                      <ha-icon @click=${e=>this.openCover(this.state.stateObj.entity_id)} class="clickIcon" icon="mdi:chevron-up"></ha-icon>
                    </div>
                  </div>
              </div>
  
  
  
  
  
            
          `;
        }
  
        /*          <state-badge .stateObj="${this.state.stateObj}" @click="${this.onRowClick}"></state-badge>
            <div class="info pointer" @click="${this.onRowClick}">
                Testname
                <div class="secondary">${this.state.stateObj.attributes.current_tilt_position}%</div>
            </div>
            <div class="entities-row">
              <ha-icon @click=${e=>this.openCover()} class="clickIcon" icon="mdi:chevron-down"></ha-icon>
              <ha-icon @click=${e=>this.stopCover()} class="clickIcon" icon="mdi:pause"></ha-icon>
              <ha-icon @click=${e=>this.closeCover()} class="clickIcon" icon="mdi:chevron-up"></ha-icon>
            </div>
                  */
  
        invertPercentage(perc) {
          return 100-perc;
        }
  
        setPositionAndTilt(entityId, posvalue, tiltvalue) {
          this._hass.callService("cover","set_cover_position",{entity_id:entityId, position:posvalue});
          this._hass.callService("cover","set_cover_tilt_position",{entity_id:entityId, tilt_position:tiltvalue});
        }
  
        stopCover(entityId) {
          this._hass.callService("cover","stop_cover",{entity_id:entityId});
        }
  
        closeCover(entityId) {
          this._hass.callService("cover","close_cover",{entity_id:entityId});
        }
  
        openCover(entityId) {
          this._hass.callService("cover","open_cover",{entity_id:entityId});
        }
  
        setPosition(entityId, value) {
          // Invert Position
          value = this.invertPosition(value);
          this._hass.callService("cover","set_cover_position",{entity_id:entityId,position:value});
        }
        setTilt(entityId) {
          // Invert Position
          var nextTilt = this.__state.stateObj.attributes.current_tilt_position + 25;
          if(nextTilt > 100) {
            nextTilt = 0;
          }
          this._hass.callService("cover","set_cover_tilt_position",{entity_id:entityId,tilt_position:nextTilt});
        }
  
        moreInfoAction(entityId) {
          return () => this.fireEvent('hass-more-info', entityId);
      }
  
        //case"tilt":this._hass.callService("cover","set_cover_tilt_position",{entity_id:this.stateObj.entity_id,tilt_position:t})
  
        //</hui-generic-entity-row>
  
        getLabel() {
          if(this._config.title == undefined) {
            return html`<div class="itemlabel">${this.state.stateObj.attributes.friendly_name}</div>`;
          }
          else
            return html``;
        }
  
        setConfig(config) {
            if (!config.entity) throw new Error('Please define a main entity.');
    
            this._config = config;
            this.onRowClick = this.moreInfoAction(config.tap_action, config.entity);
        }
  
        set hass(hass) {
            this._hass = hass;
  
            if (hass && this._config) {
                const mainStateObj = hass.states[this._config.entity];
  
                this.state = mainStateObj ? {
                    ...this.state,
                    stateObj: mainStateObj,
                } : {};
            }
        }
  
        
    }
  
    customElements.define('kech-cover-row', KechCoverRow);
  })(window.LitElement || Object.getPrototypeOf(customElements.get('hui-masonry-view') || customElements.get('hui-view')));
  
  
  