class AddScoreToMatch < ActiveRecord::Migration
  def change
    add_column :matches, :team_1_score, :integer
    add_column :matches, :team_2_score, :integer
  end
end
