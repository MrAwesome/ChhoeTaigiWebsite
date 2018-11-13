import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

import dicStruct from '../api/dicts/dictionary-struct';
import searchDicStruct from '../api/dicts/dictionary-struct-lomaji-search';

import '../api/update';

class Update extends Component {
    constructor(props) {
        super(props);

        if(!Meteor.userId()) {
            this.props.history.push('/');
            return;
        }

        // init dic row num
        let rowNum = [];
        this.dics = [];
        for (let key in dicStruct) {
            let dic = dicStruct[key].name;
            rowNum[dic] = -1;
            this.dics.push(dic);
        }

        // init search dic row num
        let searchRowNum = [];
        this.searchDics = [];
        for (let key in searchDicStruct) {
            let dic = searchDicStruct[key].name;
            rowNum[dic] = -1;
            this.searchDics.push(dic);
        }

        // state
        this.state = {
            rowNum: rowNum,
            searchRowNum: searchRowNum,
        };

        // update dic row num
        for (let idx in this.dics) {
            let dic = this.dics[idx];
            Meteor.call('update.rowNum', dic, (error, result) => {
                if (error) throw new Meteor.Error(error);
                rowNum[dic] = result[0].count;
                this.setState({
                    rowNum: rowNum,
                })
            });
            
        }

        // update search dic row num
        for (let idx in this.searchDics) {
            let dic = this.searchDics[idx];
            Meteor.call('update.searchRowNum', dic, (error, result) => {
                if (error) throw new Meteor.Error(error);
                searchRowNum[dic] = result[0].count;
                this.setState({
                    searchRowNum: searchRowNum,
                })
            });
            
        }

        this.setRowNum = this.setRowNum.bind(this);
        this.setSearchRowNum = this.setSearchRowNum.bind(this);
    }

    setRowNum(dic, num) {
        let rowNum = this.state.rowNum;
        rowNum[dic] = num;
        this.setState(rowNum);
    }

    setSearchRowNum(dic, num) {
        let searchRowNum = this.state.searchRowNum;
        searchRowNum[dic] = num;
        this.setState(searchRowNum);
    }

    update() {
        Meteor.call('update.import', (error, result) => {
            console.log(result);
        });
    }

    render() {
        // dic
        let dicRow = [];
        for (let idx in this.dics) {
            let dic = this.dics[idx];
            dicRow.push(
                <DicRow key={dic} name={dic} rowNum={this.state.rowNum[dic]} setRowNum={this.setRowNum} />
            )
        }

        // search dic
        let searchDicRow = [];
        for (let idx in this.searchDics) {
            let dic = this.searchDics[idx];
            searchDicRow.push(
                <DicRow key={dic} name={dic} rowNum={this.state.searchRowNum[dic]} setRowNum={this.setSearchRowNum} search />
            )
        }

        return (
            <div>
                <h1>更新辭典資料庫</h1>
                <h2>主要辭典</h2>
                {dicRow}
                <hr></hr>
                <h2>搜尋辭典(lomaji_search_table)</h2>
                {searchDicRow}
                <button onClick={this.update.bind(this)} className='Mbutton'>Import all</button>
            </div>
        );
    }
}

export default withRouter(Update);

class DicRow extends Component {
    delete(dic) {
        this.props.setRowNum(dic, -1);
        Meteor.call('update.delete', dic, (error, result) => {
            if (error) throw new Meteor.Error(error);
            this.props.setRowNum(dic, result[0].count);
        })
    }

    deleteSearch(dic) {
        this.props.setRowNum(dic, -1);
        Meteor.call('update.deleteSearch', dic, (error, result) => {
            if (error) throw new Meteor.Error(error);
            this.props.setRowNum(dic, result[0].count);
        })
    }

    import(dic) {
        this.props.setRowNum(dic, -1);
        Meteor.call('update.import', dic);
    }

    importSearch(dic) {
        this.props.setRowNum(dic, -1);
        Meteor.call('update.importSearch', dic);
    }

    render() {
        let deleteButton;
        let importButton;
        if (this.props.search) {
            deleteButton = <button onClick={this.deleteSearch.bind(this, this.props.name)} className='Mbutton'>delete</button>;
            importButton = <button onClick={this.importSearch.bind(this, this.props.name)} className='Mbutton'>import</button>;
        } else {
            deleteButton = <button onClick={this.delete.bind(this, this.props.name)} className='Mbutton'>delete</button>;
            importButton = <button onClick={this.import.bind(this, this.props.name)} className='Mbutton'>import</button>;
        }
        
        return (
            <div>
                <b>{this.props.name}</b>: {this.props.rowNum >= 0 ? this.props.rowNum : 'waiting'}
                {deleteButton}
                {importButton}
            </div>
        );
    }
}