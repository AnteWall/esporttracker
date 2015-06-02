require 'sidekiq/web'
Rails.application.routes.draw do
  mount RailsAdmin::Engine => '/admin', as: 'rails_admin'
  mount Sidekiq::Web => '/sidekiq'

  resources :match, only: [:show] do
    get 'track' => 'match#start_tracking'
    get 'log' => 'match#log'
  end

  scope 'api' do
    scope :match do
      get 'live' => 'match#live'
    end
  end

  get 'test' => 'home#test'

  root 'home#index'
end
