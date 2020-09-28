PlanSource::Application.routes.draw do
  get "signup_links/edit"

  authenticated :user do
    root :to => 'home#index'
  end

  root :to => "home#index"
  
  devise_for :users, skip: [:registrations]
  # We have to add the edit and update actions directly
  devise_scope :user do
    get '/users/edit' => 'devise/registrations#edit', as: :edit_user_registration
    put '/users' => 'devise/registrations#update', as: :update_user_registration
  end

  namespace :api do
    resources :jobs, except: ["new", "edit"], :as => :job
    post '/jobs/share_link' => 'jobs#sub_share_link'
    get '/jobs/:id/eligible_project_managers' => 'users#eligible_project_managers'
    get '/jobs/:id/eligible_shop_drawing_managers' => 'users#eligible_shop_drawing_managers'
    get '/jobs/:id/eligible_rfi_assignees' => 'users#eligible_rfi_assignees'
    get '/jobs/:id/eligible_shops_assignees' => 'users#eligible_shops_assignees'
    post '/jobs/:id/project_manager' => 'jobs#project_manager'
    post '/jobs/:id/shop_drawing_manager' => 'jobs#shop_drawing_manager'

    resources :plans, except: ["new", "edit", "index"]
    get '/plans/embedded/:id' => 'plans#show_embedded'
    get '/plans/records/:id' => 'plans#plan_records'
    post '/plans/records' => 'plan_records#batch_update'

    get '/user/contacts' => 'users#contacts'
    post '/user/contacts' => 'users#add_contacts'

    resources :shares, only: ["create", "destroy", "update"]
    post "/shares/batch" => "shares#batch"

    resource :token, only: ["create"] #only retrieve token
    match "/download/:id" => "downloads#download"
    match "/embed/:id" => "downloads#embed"
    post '/uploads/presign' => 'uploads#presign'

    post '/message' => 'messages#group'
    post '/message' => 'messages#group'

    post '/shops/:id/assign' => 'shops#assign'
    get '/submittals/:plan_id' => 'submittals#index'
    post '/submittals' => 'submittals#create'
    get '/submittals/download_attachment/:id' => 'submittals#download_attachment', as: :submittal_download_attachment
    post '/submittals/:id/destroy' => 'submittals#destroy'
    post '/submittals/:id' => 'submittals#update'

    post '/rfis' => 'rfis#create'
    put '/rfis/:id' => 'rfis#update'
    delete '/rfis/:id' => 'rfis#destroy'
    post '/rfis/:id/assign' => 'rfis#assign'
    get '/rfis/download_attachment/:id' => 'rfis#download_attachment', as: :rfi_download_attachment

    post '/asis' => 'asis#create'
    put '/asis/:id' => 'asis#update'
    delete '/asis/:id' => 'asis#destroy'
    post '/asis/:id/assign' => 'asis#assign'
    get '/asis/download_attachment/:id' => 'asis#download_attachment', as: :asi_download_attachment

    post '/photos/submit' => 'photos#submit_photos'
    get '/photos/download/:id' => 'photos#download_photo'
    post '/photos/:id/destroy' => 'photos#destroy'
    get '/jobs/:job_id/photos' => 'photos#show'
    get '/jobs/:job_id/renderings' => 'renderings#show'
    post '/photos/:id' => 'photos#update'

    #post '/troubleshoot' => 'troubleshoot#create'
  end

  get '/view' => 'pdf#index', as: "view_pdf"
  get '/photos/:id/gallery' => 'api/photos#gallery'

  get '/notifications/unsubscribe/:id' => 'notification#unsubscribe', as: :unsubscribe
  get '/app#/jobs/:id' => 'home#index', as: :jobs_link

  get '/jobs/:id/share' => 'api/jobs#show_sub_share_link'
  get '/share_link/company_name' => 'api/jobs#share_link_company_name'
  post '/share_link/company_name' => 'api/jobs#set_share_link_company_name', as: "set_share_link_company_name"

  # Download share link
  get '/d/:token' => 'api/plans#download_share_link', as: "download_share_link"

  resources :users, only: ["index", "edit", "update", "destroy"] do
    member do
      post :batch_shares
    end
  end
  get "/users/:id/demote" => "users#demote", as: "demote"
  get "/users/signup_link/:key", to: "signup_links#edit", as: "signup_link"
  put "/users/signup_link/:key", to: "signup_links#update"

  get "/print/asi/:id" => "print#asi", as: :print_asi

  get "/reports" => "reports#index", as: :reports
  post "/reports/shop_drawings" => "reports#shop_drawings", as: :shop_drawings_report
  get "/reports/shop_drawings/jobs" => "reports#shop_drawing_jobs", as: :shop_drawings_report_jobs
  get "/reports/rfi_asis/jobs" => "reports#rfi_asi_jobs", as: :rfi_asis_report_jobs
  post "/reports/rfi_asis" => "reports#rfi_asis", as: :rfi_asis_report

  get "/admin/sub_logins" => "admin#sub_logins"
  delete "/admin/sub_logins/:id" => "admin#delete_sub_login", as: "delete_sub_login"

  resources :emails, only: [:index, :create]
  get "emails/download" => "emails#download"

  match "/mobile" => "mobile#index"
  match "/app" => "app#index"
end
