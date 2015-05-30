class AddTournamentToMatch < ActiveRecord::Migration
  def change
    add_column :matches, :tournament, :string
  end
end
