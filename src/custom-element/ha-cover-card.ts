import { HomeAssistant } from "../ha-types";
import { html, css, LitElement, CSSResultGroup, TemplateResult, PropertyValues } from "lit";
import { property } from "lit/decorators";
import {repeat} from 'lit-html/directives/repeat.js';
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

    private entity: string = "";

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
    }

    /**
     * Called every time when entity config is updated
     * @param config Card configuration (yaml converted to JSON)
     */
    setConfig(config: ICardConfig): void {
        this.entity = config.entity;
        this.cardTitle = config.title || this.cardTitle;
    }

    /**
     * Renders the card when the update is requested (when any of the properties are changed)
     */
    render(): TemplateResult {
        return html`
        <ha-card>
            <div class="card-header">
                <div class="truncate">
                    ${this.cardTitle}
                </div>
            </div>
            <div class="card-content">
                <div>
                    <div class="entity-row">
                        <div class="icon">
                            <ha-icon
                                style="color: yellow"
                                icon="mdi:lightbulb"
                            ></ha-icon>
                        </div>
                        <div class="name truncate">
                            Entity name
                            <div class="secondary">Secondary info</div>
                        </div>
                        <div class="state">
                            ${this.state}
                        </div>
                    <div>
                </div>
            </div>
        </ha-card>
        `;
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
            const stateObj = this.hass!.states[this._config!.entity];
            const oldHass = changedProps.get("hass") as this["hass"];
            const oldStateObj = oldHass
            ? oldHass.states[this._config!.entity]
            : undefined;
    
        }
    }

}

