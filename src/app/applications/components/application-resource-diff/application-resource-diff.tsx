import { Checkbox, models } from 'argo-ui';
import * as React from 'react';

const jsonDiffPatch = require('jsondiffpatch');
require('./application-resource-diff.scss');

export interface ApplicationComponentDiffProps {
    liveState: models.TypeMeta & { metadata: models.ObjectMeta };
    targetState: models.TypeMeta & { metadata: models.ObjectMeta };
}

export class ApplicationResourceDiff extends React.Component<ApplicationComponentDiffProps, { hideDefaultedFields: boolean }> {
    constructor(props: ApplicationComponentDiffProps) {
        super(props);
        this.state = { hideDefaultedFields: true };
    }

    public render() {
        let liveState = this.props.liveState || {};
        if (this.state.hideDefaultedFields) {
            liveState = this.removeDefaultedFields(this.props.targetState || {}, liveState);
        }
        const delta = jsonDiffPatch.diff(this.props.targetState || {}, liveState) || {};
        const html = jsonDiffPatch.formatters.html.format(delta, this.props.targetState);
        return (
            <div className='application-component-diff'>
                <div className='application-component-diff__checkbox'>
                    <Checkbox id='hideDefaultedFields' checked={this.state.hideDefaultedFields}
                            onChange={() => this.setState({ hideDefaultedFields: !this.state.hideDefaultedFields })}/> <label htmlFor='hideDefaultedFields'>
                        Hide default fields
                    </label>
                </div>
                <div className='application-component-diff__manifest' dangerouslySetInnerHTML={{__html: html}}/>
            </div>
        );
    }

    private removeDefaultedFields(config: any, live: any): any {
        if (config instanceof Array) {
            const result = [];
            for (let i = 0; i < live.length; i++) {
                const v2 = live[i];
                if (config.length > i) {
                    result.push(this.removeDefaultedFields(config[i], v2));
                } else {
                    result.push(v2);
                }
            }
            return result;
        } else if (config instanceof Object) {
            const result: any = {};
            for (const k of Object.keys(config)) {
                const v1 = config[k];
                if (live.hasOwnProperty(k)) {
                    const v2 = live[k];
                    result[k] = this.removeDefaultedFields(v1, v2);
                }
            }
            return result;
        }
        return live;
    }
}
