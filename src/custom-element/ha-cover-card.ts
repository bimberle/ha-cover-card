import { HomeAssistant } from "../ha-types";
import { html, css, LitElement, CSSResultGroup, TemplateResult, PropertyValues } from "lit";
import { property } from "lit/decorators";
import { ICardConfig } from "../types";
import styles from "./card.css";
import { hasConfigOrEntityChanged } from "../has-changed";

/**
 * Main card class definition
 */
export class HaCoverCard extends LitElement {

    @property({ attribute: false })
    private cardTitle: string = "Card header";

    @property({ attribute: false })
    private state: string = "";

    @property({ attribute: false })
    private entityObj: any;

    private _hass: any;

    private entity: string = "";

    @property({ attribute: false })
    private currentTilt: number = 0;

    @property({ attribute: false })
    private addSteps: boolean = true;

    @property({ attribute: false })
    private steps: number = 10;

    @property() private _config?: ICardConfig;



    /**
     * CSS for the card
     */
    static get styles(): CSSResultGroup {
        return css(<TemplateStringsArray><any>[styles]);
    }

    /**
     * Called on every hass update
     */
    set hass(hass: HomeAssistant) {
        if (!this.entity || !hass.states[this.entity]) {
            return;
        }

        this.state = hass.states[this.entity].state;
        
        this.entityObj = hass.states[this.entity];
        
        this.currentTilt = 0;
        if(this.entityObj.attributes.current_tilt_position != undefined)
            this.currentTilt = this.invertPercentage(this.entityObj.attributes.current_tilt_position);
            
        this._hass = hass;
    }

    /**
     * Called every time when entity config is updated
     * @param config Card configuration (yaml converted to JSON)
     */
    setConfig(config: ICardConfig): void {
        this.entity = config.entity;
        this.cardTitle = config.title || this.cardTitle;
        if(config.steps)
            this.steps = config.steps;
    }

    /**
     * Renders the card when the update is requested (when any of the properties are changed)
     */
    render(): TemplateResult {
        return html`
            <div class="entity-row">
                <state-badge .stateObj="${this.entityObj}"></state-badge>
                <div class="name truncate">
                    ${this.entityObj.attributes.friendly_name}
                    <div class="secondary">${this.invertPercentage(this.entityObj.attributes.current_position)}% 
                    / ${this.invertPercentage(this.entityObj.attributes.current_tilt_position)}%</div>
                </div>
                <div class="state">
                    <ha-icon @click=${() => this.setTilt()} class="clickIcon" icon="mdi:cached"></ha-icon>
                    <ha-icon @click=${() =>this.setPositionAndTilt(0,50)} class="clickIcon" icon="mdi:reorder-horizontal"></ha-icon>
                    <div class="updown">
                    <ha-icon @click=${() =>this.closeCover()} class="clickIcon" icon="mdi:chevron-down"></ha-icon>
                    <ha-icon @click=${() =>this.stopCover()} class="clickIcon" icon="mdi:pause"></ha-icon>
                    <ha-icon @click=${() =>this.openCover()} class="clickIcon" icon="mdi:chevron-up"></ha-icon>
                    </div>
                </div>
            <div>
        `;
    }


    private setPositionAndTilt(posvalue: number, tiltvalue: number) {
        this._hass.callService("cover","set_cover_position",{entity_id:this.entityObj.entity_id, position:posvalue});
        this._hass.callService("cover","set_cover_tilt_position",{entity_id:this.entityObj.entity_id, tilt_position:tiltvalue});
    }

    private stopCover() {
        this._hass.callService("cover","stop_cover",{entity_id:this.entityObj.entity_id});
    }

    private closeCover() {
        this._hass.callService("cover","close_cover",{entity_id:this.entityObj.entity_id});
    }

    private openCover() {
        this._hass.callService("cover","open_cover",{entity_id:this.entityObj.entity_id});
    }

    private setTilt() {
        // Invert Position
        var nextTilt = 0;
        console.log("Current Tilt %d", this.currentTilt);

        if(this.currentTilt == 100)
            this.addSteps = false;

        if(this.currentTilt == 0)
            this.addSteps = true;

        if(this.addSteps)
            nextTilt = this.currentTilt + this.steps;
        else
            nextTilt = this.currentTilt - this.steps;

        console.log("Set position %d", nextTilt);
        this._hass.callService("cover","set_cover_tilt_position",{entity_id:this.entityObj.entity_id, tilt_position:nextTilt});
    }

    private invertPercentage(perc: number) {
        return 100-perc;
    }

    protected shouldUpdate(changedProps: PropertyValues): boolean {
        if (changedProps.has("fileList")) {
            return true;
        }
    
        return hasConfigOrEntityChanged(this, changedProps);
        }
    
    protected updated(changedProps: PropertyValues) {
        super.updated(changedProps);
    
        if (changedProps.has("hass")) {
            const entityObj = this.hass!.states[this._config!.entity];
            const oldHass = changedProps.get("hass") as this["hass"];
            const oldentityObj = oldHass
            ? oldHass.states[this._config!.entity]
            : undefined;
    
        }
    }

}

