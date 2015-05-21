Rails.application.routes.draw do
  mount RailsAdmin::Engine => '/admin', as: 'rails_admin'
  root 'home#index'

  resources :match, only: [:show] do
    get 'track' => 'match#start_tracking'
    get 'log' => 'match#log'
  end
    
end
