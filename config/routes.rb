Netlab::Application.routes.draw do

  resources :workspace_tasks do
    member do
      put 'do_auto_task'
    end
  end

  resources :workspace_invitations
  
  resources :chat_invitations

  resources :workspaces do
    member do
      get 'manage'
      get 'conf'
      get 'download_captures'
    end
  end

  resources :workspaces

  resources :scenes do
    member do
      get 'delete'
      get 'back_edit_ajax'
      get 'show_edit_ajax'
    end

    collection do
      get 'back_new_ajax'
    end
  end

  resources :scenes
  resources :profiles do
    collection do
      get 'info'
    end
  end
  
  get '/help', to: 'help#index', as: 'help'

  mount Cloudstrg::Engine, :at => 'cloudstrg'
  mount Gdrivestrg::Engine, :at => 'gdrive'

  get "home/index"
  get "home/close"

  devise_for :users, :controllers => { :omniauth_callbacks => "users/omniauth_callbacks" }
  devise_for :admins


  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  root :to => 'home#index'

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id))(.:format)'
end
