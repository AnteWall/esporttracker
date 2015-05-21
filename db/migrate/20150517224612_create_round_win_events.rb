class CreateRoundWinEvents < ActiveRecord::Migration
  def change
    create_table :round_win_events do |t|
      t.boolean :ct_win
      t.boolean :t_win

      t.timestamps null: false
    end
  end
end
