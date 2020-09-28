import React from 'react';
import * as _ from "underscore"

import Util from "./util.js"
import StyledDropzone from "./StyledDropzone"
import './App.css';

const statusOptions = ['', 'Submitted', 'Special Inspection', 'Approved',
      'Approved as Noted', 'Revise & Resubmit', 'Record Copy'];

class EditPlanModal extends React.Component {
  constructor(props) {
    super(props)

    const plan = _.pick(props.plan,
      "plan_name", "plan_num", "tab", "csi", "status", "filename",
      "plan_link", "planRecords",
    );

    console.log(props.plan)
    this.state = {
      uploadProgress: null,
      plan: plan,
      errors: {},
    };
  }

  formatCSI(csi) {
    var current = (csi || "").split('');

    if (current.length > 2) {
      if (current[2] != " ") {
        current.splice(2, 0, " ");
      }
    }
    if (current.length > 5) {
      if (current[5] != " ") {
        current.splice(5, 0, " ");
      }
    }

    return current.join("");
  }

  onUploadSuccess = (newFileId, newFilename) => {
    const { plan } = this.state;
    this.setState({
      uploadProgress: null,
      plan: {
        ...plan,
        new_file_id: newFileId,
        new_file_original_filename: newFilename,
      }
    });
  }

  onDrop = (files) => {
    console.log(files);
    const file = (files || [])[0];
    const self = this;
    if (!file) return;

    this.setState({ uploadProgress: 0 });

    $.ajax({
      url: "/api/uploads/presign",
      type: 'POST',
      data : {
        filename: file.name,
        prefix: "plans",
      },
    }).then(function(data, t, xhr){
      console.log(data);
      const formData = new FormData();

      const fields = data.fields || {};
      const newFileId = (fields.key || "").split("/")[1];
      for (var k in fields) { formData.append(k, fields[k]) }

      // File needs to be added last for some reason.
      formData.append("file", file);

      $.ajax({
        type: "POST",
        url: data.url,
        data: formData,
        processData : false,
        cache : false,
        contentType : false,
        xhr: function(){
          var xhr = $.ajaxSettings.xhr() ;
          xhr.upload.onprogress = (evt) => {
            self.setState({ uploadProgress: evt.loaded/evt.total*100 });
          };
          return xhr;
        },
        success: () => {
          self.onUploadSuccess(newFileId, file.name);
        }
      });
    });
  }

  onClickSave = () => {
    const { onSave } = this.props;
    const { plan, uploadProgress, errors } = this.state;

    if (uploadProgress != null) return;

    if (plan.new_plan_link) {
      if (!plan.new_plan_link.startsWith("http")) plan.new_plan_link = "http://" + plan.new_plan_link;

      const linkMatch = plan.new_plan_link.match(/^(https?:\/\/)?([a-zA-Z0-9_\-]+\.)?[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+(\/[a-zA-Z0-9_\-\/]+)?(\?.*)?$/g);
      if (!linkMatch) {
        return this.setState({ errors: { ...errors, new_plan_link: "Not a valid link." } });
      }
    }

    if (onSave) onSave(plan);
  }

  onToggleArchivedPlanRecordFor(planRecordId) {
    return () => {
      const { plan } = this.state;
      const planRecords = plan.planRecords || [];
      const index = planRecords.findIndex(pr => pr.id == planRecordId);
      if (index < 0) return;

      planRecords[index] = {
        ...planRecords[index],
        archived: !planRecords[index].archived
      };

      this.setState({ plan: { ...plan, planRecords } });
    }
  }

  onChangeFor(attr) {
    return (e) => {
      const { plan } = this.state;
      let val = e.target.value;

      if (attr == "csi") {
        val = val.replace(/ /g, "");
        if (val.length > 6 || !val.match(/^[0-9]*$/)) return;
      }

      if (attr == "plan_num") {
        if (!val.match(/^[0-9]*$/)) return;
      }

      this.setState({ plan: { ...plan, [attr]: val } });
    }
  }

  onClearFor(attr) {
    return (e) => {
      const { plan } = this.state;
      const newPlan = { ...plan };

      if (attr == "new_file_original_filename" || attr == "new_file_id") {
        newPlan["new_file_original_filename"] = null;
        newPlan["new_file_id"] = null;
      }

      newPlan[attr] = null;

      this.setState({ plan: newPlan });
    }
  }

  renderPlansForm() {
    const { isMyPlan } = this.props;
    const { plan } = this.state;
    const planRecords = plan.planRecords || [];

    return (
      <div className="form-horizontal">
        <div className="form-group">
          <label className="col-sm-2 control-label">Name</label>
          <div className="col-sm-10">
            <input className="ps-input" type="text" value={plan.plan_name} onChange={this.onChangeFor("plan_name")} />
            <div className="help-inline"></div>
          </div>
        </div>
        <div className="form-group">
          <label className="col-sm-2 control-label">Number</label>
          <div className="col-sm-10">
            <input className="ps-input" type="text" value={plan.plan_num} onChange={this.onChangeFor("plan_num")} />
            <div className="help-inline"></div>
          </div>
        </div>
        {plan.filename ?
          <div className="form-group">
            <label className="col-sm-2 control-label">Filename</label>
            <div className="col-sm-10 form-control-static">
              {plan.filename}
            </div>
          </div>
          :
          <div className="form-group">
            <label className="col-sm-2 control-label">Plan Link</label>
            <div className="col-sm-10 form-control-static">
              <a href={plan.plan_link} target="_blank">{plan.plan_link}</a>
            </div>
          </div>
        }
        <div className="form-group">
          <label className="col-sm-2 control-label">Tab</label>
          <div className="col-sm-10 form-control-static">
            {isMyPlan ?
              <div>
                <select
                  value={plan.tab || ""}
                  id="edit-select-tab"
                  className="form-control ps-input"
                  style={{ width: 230, display: "inline-block" }}
                  onChange={this.onChangeFor("tab")}
                >
                  <option value="Pre-Development">Pre-Development</option>
                  <option value="Plans">Plans</option>
                  <option value="Addendums">Addendums</option>
                  <option value="Shops">Shops</option>
                  <option value="Special Inspections">Special Inspections</option>
                  <option value="Consultants">Support</option>
                  <option value="Client">Client</option>
                  <option value="Calcs & Misc">Calcs &amp; Misc</option>
                </select>
              </div>
            : plan.tab}
          </div>
        </div>
      </div>
    );
  }

  renderShopsForm() {
    const { isMyPlan } = this.props;
    const { plan } = this.state;
    const planRecords = plan.planRecords || [];

    return (
      <div className="form-horizontal">
        <div className="form-group">
          <label className="col-sm-2 control-label">Name</label>
          <div className="col-sm-10">
            <input className="ps-input" type="text" value={plan.plan_name} onChange={this.onChangeFor("plan_name")} />
            <div className="help-inline"></div>
          </div>
        </div>
        <div className="form-group">
          <label className="col-sm-2 control-label">CSI</label>
          <div className="col-sm-10">
            <input className="ps-input" type="text" value={this.formatCSI(plan.csi)} onChange={this.onChangeFor("csi")} />
            <div className="help-inline"></div>
          </div>
        </div>
        <div className="form-group">
          <label className="col-sm-2 control-label">Status</label>
          <div className="col-sm-10">
            <select
              value={plan.status || ""}
              id="edit-select-status"
              className="form-control ps-input"
              style={{ width: 230, display: "inline-block" }}
              onChange={this.onChangeFor("status")}
            >
              {statusOptions.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            <div className="help-inline"></div>
          </div>
        </div>
        {plan.filename ?
          <div className="form-group">
            <label className="col-sm-2 control-label">Filename</label>
            <div className="col-sm-10 form-control-static">
              {plan.filename}
            </div>
          </div>
          :
          <div className="form-group">
            <label className="col-sm-2 control-label">Plan Link</label>
            <div className="col-sm-10 form-control-static">
              <a href={plan.plan_link} target="_blank">{plan.plan_link}</a>
            </div>
          </div>
        }
        <div className="form-group">
          <label className="col-sm-2 control-label">Tab</label>
          <div className="col-sm-10 form-control-static">
            {isMyPlan ?
              <div>
                <select
                  value={plan.tab || ""}
                  id="edit-select-tab"
                  className="form-control ps-input"
                  style={{ width: 230, display: "inline-block" }}
                  onChange={this.onChangeFor("tab")}
                >
                  <option value="Pre-Development">Pre-Development</option>
                  <option value="Plans">Plans</option>
                  <option value="Addendums">Addendums</option>
                  <option value="Shops">Shops</option>
                  <option value="Special Inspections">Special Inspections</option>
                  <option value="Consultants">Support</option>
                  <option value="Client">Client</option>
                  <option value="Calcs & Misc">Calcs &amp; Misc</option>
                </select>
              </div>
            : plan.tab}
          </div>
        </div>
      </div>
    );
  }

  renderTabForm() {
    const { plan } = this.state;

    switch (plan.tab) {
      case "Pre-Development":
      case "Plans":
      case "Addendums":
      case "Consultants":
      case "Client":
      case "Calcs & Misc":
        return this.renderPlansForm();
      case "Shops":
      case "Special Inspections":
        return this.renderShopsForm();
      default:
        return "";
    }
  }

  render() {
    const { isMyPlan, onClose } = this.props;
    const { plan, uploadProgress, errors } = this.state;
    const planRecords = plan.planRecords || [];

    return (
      <div className="modal-wrapper">
        <div className="overlay"></div>
        <div className="dialog box box-border" style={{ width: 600 }}>
          <div className="header">
            <div className="pull-right">
              <a className="button button-blue" onClick={this.onClickSave}>Save</a>
              <button className="close" onClick={onClose}><span>&times;</span></button>
            </div>
            <h4 className="modal-title">Edit {plan.plan_name}</h4>
          </div>
          <div className="body">
            <p>Edit attributes and select save.</p>
            {this.renderTabForm()}

            <hr/>

            {((!plan.new_file_original_filename && !uploadProgress) || plan.new_plan_link) &&
              <div className="form-horizontal">
                <h4 className="title">Add a link</h4>
                {plan.new_plan_link && <a onClick={this.onClearFor("new_plan_link")}>Clear link</a>}

                <div className="form-group">
                  <label className="col-sm-2 control-label">New Link</label>
                  <div className="col-sm-10">
                    <input className="ps-input ps-input-lg" type="text" value={plan.new_plan_link || ""} onChange={this.onChangeFor("new_plan_link")} placeholder="http://..." />
                    <div className="help-inline">{errors.new_plan_link}</div>
                  </div>
                </div>

                {plan.new_plan_link && <p className="bold">Don't forget to click the "Save" button to add this link.</p>}
              </div>
            }

            {(!plan.new_plan_link || plan.new_file_original_filename) &&
              <div>
                <h4 className="title">Upload a file</h4>
                {plan.new_file_original_filename && <a onClick={this.onClearFor("new_file_original_filename")}>Clear file</a>}
                <div className="control-group">
                  <div className="controls">
                      <p id="plan-filename" className="bold">
                        {plan.new_file_original_filename && "(New File) " + plan.new_file_original_filename}
                      </p>
                      {uploadProgress == null && <StyledDropzone
                        multiple={false}
                        onDrop={this.onDrop}
                      />}
                      <div id="plan-progress-bar" className="progress" style={{ display: uploadProgress ? "block" : "none" }}>
                        <div className="progress-bar" style={{ width: uploadProgress || 0 }}></div>
                      </div>
                      {plan.new_file_original_filename && <p className="bold">Don't forget to click the "Save" button to add this file.</p>}
                  </div>
                </div>
              </div>
            }

            <hr/>

            <h4 className="title">Plan History</h4>
            {planRecords.length > 0 &&
              <p>
                Select past plan to hide it from displaying in a plan's details.
              </p>
            }

            <div className="container-fluid">
              {planRecords.length == 0 &&
                <div>This plan has no plan history.</div>
              }

              {planRecords.map(pr => (
                <div key={pr.id} className="row" style={{ marginBottom: 15 }}>
                  <div className="col-sm-8">
                    <input
                      className="archived-box"
                      style={{ marginRight: 10 }}
                      type="checkbox"
                      checked={pr.archived}
                      onChange={this.onToggleArchivedPlanRecordFor(pr.id)}
                    />
                    {pr.filename && <a
                      href={`/api/download/${pr.id}?type=plan_record`}
                      title={pr.filename}
                    >
                      <span
                        style={{ fontSize: "110%", marginRight: 10 }}
                        className="glyphicon glyphicon-download"
                      ></span>
                    </a>}
                    {pr.plan_link &&
                      <a href={pr.plan_link} >
                        <span
                          style={{ fontSize: "110%", marginRight: 10 }}
                          className="glyphicon glyphicon-link"
                        ></span>
                      </a>
                    }
                    {pr.filename && <a
                        style={{ wordWrap: "break-word" }}
                        href={`/api/plans/embedded/${pr.id}?type=plan_record`}
                        target="_blank"
                      >{pr.filename}</a>
                    }
                    {pr.plan_link && <a
                        style={{ wordWrap: "break-word" }}
                        href={pr.plan_link}
                        target="_blank"
                      >{pr.plan_link}</a>
                    }
                  </div>
                  <div className="col-sm-4" style={{ paddingLeft: 30 }}>
                    <div>changed {Util.dateFromNow(pr.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="footer">
            <div className="buttons">
              <a className="button button-blue" onClick={this.onClickSave}>Save</a>
              &nbsp;
              <a className="button" onClick={onClose}>Close</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default EditPlanModal;
