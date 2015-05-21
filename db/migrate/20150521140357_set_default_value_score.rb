class SetDefaultValueScore < ActiveRecord::Migration
  def change
    add_column :matches, :team_1, :string
    add_column :matches, :team_2, :string
    change_column :matches, :team_1_score, :integer, :default => 0
    change_column :matches, :team_2_score, :integer, :default => 0
  end
end
