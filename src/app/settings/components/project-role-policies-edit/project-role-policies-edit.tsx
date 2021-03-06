import * as React from 'react';
import * as ReactForm from 'react-form';

import { DataLoader } from '../../../shared/components';
import { Application } from '../../../shared/models';
import { services } from '../../../shared/services';

interface ProjectRolePoliciesProps {
    projName: string;
    roleName: string;
    policies: string[];
    formApi: ReactForm.FormApi;
    newRole: boolean;
}

function generatePolicy(project: string, role: string, action?: string, object?: string, permission?: string): string {
    return `p, proj:${project}:${role}, applications, ${action || ''}, ${project}/${object || ''}, ${permission || ''}`;
}

const actions = ['get', 'create', 'update', 'delete', 'sync', 'rollback', 'terminateop'];

export const ProjectRolePoliciesEdit = (props: ProjectRolePoliciesProps) => (
    <DataLoader load={() => services.applications.list([props.projName])} ref={(loader) => this.loader = loader}>
    {(applications) => (
        <React.Fragment>
            <h4>Policies</h4>
            { props.policies.length > 0 ? (
                <div className='argo-table-list'>
                    <div className='argo-table-list__head'>
                        <div className='row'>
                            <div className='columns small-4'>ACTION</div>
                            <div className='columns small-4'>OBJECT</div>
                            <div className='columns small-4'>PERMISSION</div>
                        </div>
                    </div>

                    <div className='argo-table-list__row'>
                    {props.policies.map((policy, i) => (
                            <Policy key={i} field={['policies', i]}
                                formApi={props.formApi} policy={policy}
                                projName={props.projName}
                                roleName={props.roleName}
                                deletePolicy={() => props.formApi.setValue('policies', removeEl(props.policies, i))}
                                availableApps={applications}
                                actions={actions}
                            />
                            ))}
                    </div>
                </div>
            ) : <div className='white-box'><p>Role has no policies</p></div> }
            <a onClick={() => {
                const newPolicy = generatePolicy(props.projName, props.roleName);
                props.formApi.setValue('policies', (props.formApi.values.policies || []).concat(newPolicy));
            }}>Add policy</a>
        </React.Fragment>
    )}
    </DataLoader>
);

interface PolicyProps {
    projName: string;
    roleName: string;
    policy: string;
    fieldApi: ReactForm.FieldApi;
    actions: string[];
    availableApps: Application[];
    deletePolicy: () => void;
}

function removeEl(items: any[], index: number) {
    items.splice(index, 1);
    return items;
}

class PolicyWrapper extends React.Component<PolicyProps, any> {

    public render() {
        return (
                <div className='row'>
                    <div className='columns small-4'>
                        <datalist id='action'>
                            {this.props.actions !== undefined && this.props.actions.length > 0 && this.props.actions.map((action) => (
                                <option key={action}>{action}</option>
                            ))}
                            <option key='wildcard'>*</option>
                        </datalist>
                        <input className='argo-field' list='action' value={this.getAction()} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            this.setAction(e.target.value);
                        }}/>
                    </div>
                    <div className='columns small-4'>
                        <datalist id='object'>
                            {this.props.availableApps !== undefined && this.props.availableApps.length > 0 && this.props.availableApps.map((app) => (
                                <option key={app.metadata.name}>{this.props.projName}/{app.metadata.name}</option>
                            ))}
                            <option key='wildcard'>{this.props.projName}/*</option>
                        </datalist>
                        <input className='argo-field' list='object' value={this.getObject()} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            this.setObject(e.target.value);
                        }}/>
                    </div>
                    <div className='columns small-3'>
                        <datalist id='permission'>
                            <option>allow</option>
                            <option>deny</option>
                        </datalist>
                        <input className='argo-field' list='permission' value={this.getPermision()} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            this.setPermission(e.target.value);
                        }}/>
                    </div>
                    <div className='columns small-1'>
                        <i className='fa fa-times' onClick={() => this.props.deletePolicy()} style={{cursor: 'pointer'}}/>
                    </div>
                </div>
        );
    }

    private getAction(): string {
        const fields = (this.props.fieldApi.getValue() as string).split(',');
        if (fields.length !== 6) {
            return '';
        }
        return fields[3].trim();
    }

    private setAction(action: string) {
        const fields = (this.props.fieldApi.getValue() as string).split(',');
        if (fields.length !== 6) {
            this.props.fieldApi.setValue(generatePolicy(this.props.projName, this.props.roleName, action, '', ''));
            return;
        }
        fields[3] = ` ${action}`;
        this.props.fieldApi.setValue(fields.join());
    }

    private getObject(): string {
        const fields = (this.props.fieldApi.getValue() as string).split(',');
        if (fields.length !== 6) {
            return '';
        }
        return fields[4].trim();
    }

    private setObject(object: string) {
        const fields = (this.props.fieldApi.getValue() as string).split(',');
        if (fields.length !== 6) {
            this.props.fieldApi.setValue(generatePolicy(this.props.projName, this.props.roleName, '', object, ''));
            return;
        }
        fields[4] = ` ${object}`;
        this.props.fieldApi.setValue(fields.join());
    }

    private getPermision(): string {
        const fields = (this.props.fieldApi.getValue() as string).split(',');
        if (fields.length !== 6) {
            return '';
        }
        return fields[5].trim();
    }
    private setPermission(permission: string) {
        const fields = (this.props.fieldApi.getValue() as string).split(',');
        if (fields.length !== 6) {
            this.props.fieldApi.setValue(generatePolicy(this.props.projName, this.props.roleName, '', '', permission));
            return;
        }
        fields[5] = ` ${permission}`;
        this.props.fieldApi.setValue(fields.join());
    }
}

const Policy = ReactForm.FormField(PolicyWrapper);
