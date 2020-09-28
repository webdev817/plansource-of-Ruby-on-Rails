import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';

import App from './App';

window.openEditPlanModal = (plan, isMyPlan = false, onSave) => {
  const container = document.getElementById('plansource-modal');
  const onClose = _ => { ReactDOM.unmountComponentAtNode(container) };

  ReactDOM.render(
    <App
      plan={plan}
      isMyPlan={isMyPlan}
      onSave={plan => {
        onSave(plan);
        onClose();
      }}
      onClose={onClose}
    />, container);
}

